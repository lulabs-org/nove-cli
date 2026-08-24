import { expect } from 'chai';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ApiError, fetchApi } from '../dist/utils/api.js';

describe('fetchApi', () => {
  let configDir: string;
  let originalApiUrl: string | undefined;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    configDir = mkdtempSync(path.join(tmpdir(), 'nove-cli-api-'));
    writeFileSync(path.join(configDir, 'auth.json'), JSON.stringify({ apiKey: 'test-key' }));
    originalApiUrl = process.env.NOVE_API_URL;
    originalFetch = globalThis.fetch;
    delete process.env.NOVE_API_URL;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete process.env.NOVE_API_URL;
    else process.env.NOVE_API_URL = originalApiUrl;
    rmSync(configDir, { force: true, recursive: true });
  });

  it('uses NOVE_API_URL before persistent config and normalizes URL joining', async () => {
    writeFileSync(
      path.join(configDir, 'config.json'),
      JSON.stringify({ apiUrl: 'https://config.example.invalid/base' })
    );
    process.env.NOVE_API_URL = 'https://env.example.invalid/api/';
    let requestUrl = '';
    let requestHeaders: Headers | undefined;
    globalThis.fetch = async (input, init) => {
      requestUrl = String(input);
      requestHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      });
    };

    const result = await fetchApi('/meetings?page=1', { retries: 0 }, configDir);

    expect(result).to.deep.equal({ ok: true });
    expect(requestUrl).to.equal('https://env.example.invalid/api/meetings?page=1');
    expect(requestHeaders?.get('x-api-key')).to.equal('test-key');
  });

  it('uses the persistent API URL when no environment override is present', async () => {
    writeFileSync(
      path.join(configDir, 'config.json'),
      JSON.stringify({ apiUrl: 'https://config.example.invalid/base/' })
    );
    let requestUrl = '';
    globalThis.fetch = async (input) => {
      requestUrl = String(input);
      return new Response('{}', { headers: { 'content-type': 'application/json' } });
    };

    await fetchApi('/minutes/minute-1', { retries: 0 }, configDir);

    expect(requestUrl).to.equal('https://config.example.invalid/base/minutes/minute-1');
  });

  it('returns undefined for a 204 response', async () => {
    process.env.NOVE_API_URL = 'https://api.example.invalid';
    globalThis.fetch = async () => new Response(null, { status: 204 });

    const result = await fetchApi('/meetings/meeting-1', { method: 'DELETE' }, configDir);

    expect(result).to.equal(undefined);
  });

  it('exposes structured API errors and request IDs', async () => {
    process.env.NOVE_API_URL = 'https://api.example.invalid';
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Access denied' }), {
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'request-123',
        },
        status: 403,
      });

    try {
      await fetchApi('/admin/users', { retries: 0 }, configDir);
      expect.fail('Expected fetchApi to throw');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(ApiError);
      expect((error as ApiError).toJSON()).to.deep.equal({
        code: 'API_PERMISSION_ERROR',
        details: { message: 'Access denied' },
        message: 'Access denied',
        requestId: 'request-123',
        status: 403,
      });
    }
  });

  it('retries retryable GET responses but not POST requests', async () => {
    process.env.NOVE_API_URL = 'https://api.example.invalid';
    let getAttempts = 0;
    globalThis.fetch = async () => {
      getAttempts++;
      if (getAttempts < 3) return new Response('Unavailable', { status: 503 });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      });
    };

    const result = await fetchApi('/meetings', { retries: 2, retryDelayMs: 0 }, configDir);
    expect(result).to.deep.equal({ ok: true });
    expect(getAttempts).to.equal(3);

    let postAttempts = 0;
    globalThis.fetch = async () => {
      postAttempts++;
      return new Response('Unavailable', { status: 503 });
    };

    try {
      await fetchApi('/meetings', { method: 'POST', retries: 2, retryDelayMs: 0 }, configDir);
      expect.fail('Expected fetchApi to throw');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(ApiError);
      expect((error as ApiError).code).to.equal('API_SERVER_ERROR');
      expect(postAttempts).to.equal(1);
    }
  });

  it('distinguishes timeouts, invalid JSON, and missing authentication', async () => {
    process.env.NOVE_API_URL = 'https://api.example.invalid';
    globalThis.fetch = async (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });

    try {
      await fetchApi('/meetings', { retries: 0, timeoutMs: 5 }, configDir);
      expect.fail('Expected fetchApi to time out');
    } catch (error: unknown) {
      expect((error as ApiError).code).to.equal('API_TIMEOUT');
    }

    globalThis.fetch = async () =>
      new Response('{invalid', { headers: { 'content-type': 'application/json' } });
    try {
      await fetchApi('/meetings', { retries: 0 }, configDir);
      expect.fail('Expected invalid JSON to throw');
    } catch (error: unknown) {
      expect((error as ApiError).code).to.equal('INVALID_API_RESPONSE');
    }

    rmSync(path.join(configDir, 'auth.json'));
    try {
      await fetchApi('/meetings', { retries: 0 }, configDir);
      expect.fail('Expected missing authentication to throw');
    } catch (error: unknown) {
      expect((error as ApiError).code).to.equal('AUTHENTICATION_REQUIRED');
    }
  });

  it('reports network failures separately from API responses', async () => {
    process.env.NOVE_API_URL = 'https://api.example.invalid';
    globalThis.fetch = async () => {
      throw new TypeError('socket unavailable');
    };

    try {
      await fetchApi('/meetings', { retries: 0 }, configDir);
      expect.fail('Expected a network error');
    } catch (error: unknown) {
      expect(error).to.be.instanceOf(ApiError);
      expect((error as ApiError).code).to.equal('API_NETWORK_ERROR');
      expect((error as ApiError).message).to.equal('Unable to reach the Nove API.');
    }
  });
});
