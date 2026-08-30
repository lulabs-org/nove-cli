import { expect } from 'chai';
import * as crypto from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { fetchApi } from '../dist/utils/api.js';
import { getAuthStatus, getOAuthAuth, saveOAuthAuth } from '../dist/utils/auth.js';
import {
  DEFAULT_OAUTH_SCOPES,
  loginWithBrowser,
  refreshOAuthAccessToken,
  startCallbackServer,
} from '../dist/utils/oauth.js';

/* eslint-disable camelcase -- OAuth wire fields are defined by the protocol. */

function listen(server: Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Server did not bind.');
      resolve(address.port);
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function body(request: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let value = '';
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => { value += chunk; });
    request.on('end', () => resolve(value));
    request.on('error', reject);
  });
}

describe('OAuth browser authentication', () => {
  let configDir: string;
  let previousApiUrl: string | undefined;

  beforeEach(() => {
    configDir = mkdtempSync(path.join(tmpdir(), 'nove-cli-oauth-'));
    previousApiUrl = process.env.NOVE_API_URL;
  });

  afterEach(() => {
    if (previousApiUrl === undefined) delete process.env.NOVE_API_URL;
    else process.env.NOVE_API_URL = previousApiUrl;
    rmSync(configDir, { force: true, recursive: true });
  });

  it('requests project, product, and order permissions by default', () => {
    expect(DEFAULT_OAUTH_SCOPES).to.include.members([
      'product:read', 'product:create', 'product:update', 'product:toggle-status', 'product:delete',
      'project:read', 'project:create', 'project:update', 'project:toggle-status', 'project:delete',
      'order:read', 'order:create', 'order:update', 'order:status', 'order:delete',
    ]);
  });

  it('keeps listening after a forged state and accepts the valid loopback callback', async () => {
    const callback = await startCallbackServer('expected-state', 2000);
    const invalid = await fetch(`${callback.redirectUri}?state=wrong&code=forged`);
    expect(invalid.status).to.equal(400);
    expect(await invalid.text()).to.include('data-status="error"');

    const valid = await fetch(`${callback.redirectUri}?state=expected-state&code=real-code`);
    expect(valid.status).to.equal(200);
    const validPage = await valid.text();
    expect(validPage).to.include('data-status="success"');
    expect(validPage).to.include('Ctrl + W');
    expect(validPage).not.to.include('<button');
    expect(await callback.wait()).to.deep.equal({ code: 'real-code' });
  });

  it('completes PKCE login and exposes only non-secret status fields', async () => {
    let expectedChallenge = '';
    const api = createServer(async (request, response) => {
      if (request.url === '/api/oauth/token') {
        const values = new URLSearchParams(await body(request));
        const verifier = values.get('code_verifier') ?? '';
        expect(crypto.createHash('sha256').update(verifier).digest('base64url')).to.equal(expectedChallenge);
        expect(values.get('client_secret')).to.equal(null);
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({
          access_token: 'access-secret',
          expires_in: 900,
          organization_id: 'org-1',
          refresh_token: 'refresh-secret',
          scope: 'meeting:read',
          token_type: 'Bearer',
        }));
        return;
      }

      response.writeHead(404).end();
    });
    const port = await listen(api);
    process.env.NOVE_API_URL = `http://127.0.0.1:${port}`;

    try {
      const status = await loginWithBrowser(configDir, {
        noBrowser: true,
        onAuthorizationUrl(authorizationUrl) {
          const url = new URL(authorizationUrl);
          expectedChallenge = url.searchParams.get('code_challenge') ?? '';
          const redirectUri = url.searchParams.get('redirect_uri');
          const state = url.searchParams.get('state');
          if (!redirectUri || !state) throw new Error('Authorization URL is incomplete.');
          setTimeout(() => {
            fetch(`${redirectUri}?state=${encodeURIComponent(state)}&code=test-code`).catch(() => {});
          }, 0);
        },
        scopes: ['meeting:read'],
      });
      expect(status).to.deep.include({ authenticated: true, method: 'oauth', organizationId: 'org-1' });
      expect(status).not.to.have.property('accessToken');
      expect(status).not.to.have.property('refreshToken');
      expect(getAuthStatus(configDir)).not.to.have.property('refreshToken');
    } finally {
      await close(api);
    }
  });

  it('single-flights refresh and retries one unauthorized API request with the new bearer token', async () => {
    saveOAuthAuth(configDir, {
      accessToken: 'expired-access',
      accessTokenExpiresAt: new Date(0).toISOString(),
      clientId: 'nove-cli',
      organizationId: 'org-1',
      refreshToken: 'refresh-1',
      scopes: ['meeting:read'],
    });
    let refreshes = 0;
    let businessRequests = 0;
    const api = createServer(async (request, response) => {
      if (request.url === '/api/oauth/token') {
        refreshes += 1;
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({
          access_token: refreshes === 1 ? 'access-1' : 'access-2',
          expires_in: 900,
          organization_id: 'org-1',
          refresh_token: `refresh-${refreshes + 1}`,
          scope: 'meeting:read',
          token_type: 'Bearer',
        }));
        return;
      }

      if (request.url === '/meetings') {
        businessRequests += 1;
        if (businessRequests === 1) {
          expect(request.headers.authorization).to.equal('Bearer access-1');
          response.writeHead(401, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ message: 'expired' }));
          return;
        }

        expect(request.headers.authorization).to.equal('Bearer access-2');
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ ok: true }));
        return;
      }

      response.writeHead(404).end();
    });
    const port = await listen(api);
    process.env.NOVE_API_URL = `http://127.0.0.1:${port}`;

    try {
      const firstTokens = await Promise.all([
        refreshOAuthAccessToken(configDir),
        refreshOAuthAccessToken(configDir),
      ]);
      expect(firstTokens).to.deep.equal(['access-1', 'access-1']);
      expect(refreshes).to.equal(1);
      expect(await fetchApi('/meetings', {}, configDir)).to.deep.equal({ ok: true });
      expect(refreshes).to.equal(2);
      expect(getOAuthAuth(configDir)?.refreshToken).to.equal('refresh-3');
    } finally {
      await close(api);
    }
  });
});
