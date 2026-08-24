import { expect } from 'chai';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface CliResult {
  code: null | number;
  stderr: string;
  stdout: string;
}

interface RequestSnapshot {
  body: string;
  headers: IncomingMessage['headers'];
  method: string;
  url: URL;
}

interface SuccessCase {
  args: string[];
  assertRequest: (request: RequestSnapshot) => void;
  name: string;
  response?: unknown;
  status?: number;
}

const apiKey = 'matrix-test-key';

function runCli(args: string[], environment: NodeJS.ProcessEnv, input = ''): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['bin/run.js', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, ...environment, NO_COLOR: '1', NODE_ENV: 'production' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    let stdout = '';
    child.stderr.setEncoding('utf8');
    child.stdout.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stderr, stdout }));
    child.stdin.end(input);
  });
}

function readRequest(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function listen(handler: (request: IncomingMessage, response: ServerResponse) => void) {
  const server = createServer(handler);
  return new Promise<{ close: () => Promise<void>; url: string }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Test server did not bind.');
      resolve({
        close: () => new Promise<void>((done, reject) => {
          server.close((error) => (error ? reject(error) : done()));
        }),
        url: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function login(testHome: string): Promise<void> {
  const server = await listen((request, response) => {
    expect(request.url).to.equal('/api/auth/api-key/validate');
    expect(request.headers['x-api-key']).to.equal(apiKey);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ authenticated: true }));
  });
  try {
    const result = await runCli(['login', '--json'], {
      HOME: testHome,
      NOVE_API_KEY: apiKey,
      NOVE_API_URL: server.url,
    });
    expect(result.code).to.equal(0);
  } finally {
    await server.close();
  }
}

function jsonBody(request: RequestSnapshot): Record<string, unknown> {
  return JSON.parse(request.body) as Record<string, unknown>;
}

function expectRequest(method: string, pathname: string, body?: Record<string, unknown>) {
  return (request: RequestSnapshot): void => {
    expect(request.method).to.equal(method);
    expect(request.url.pathname).to.equal(pathname);
    expect(request.headers['x-api-key']).to.equal(apiKey);
    if (body) expect(jsonBody(request)).to.deep.equal(body);
  };
}

async function runSuccessCase(testHome: string, testCase: SuccessCase): Promise<void> {
  let assertionError: unknown;
  const server = await listen(async (incoming, response) => {
    const body = await readRequest(incoming);
    try {
      testCase.assertRequest({
        body,
        headers: incoming.headers,
        method: incoming.method ?? 'GET',
        url: new URL(incoming.url ?? '/', 'http://localhost'),
      });
    } catch (error: unknown) {
      assertionError = error;
    }

    response.statusCode = testCase.status ?? 200;
    if (response.statusCode === 204) {
      response.end();
      return;
    }

    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(testCase.response ?? { id: 'result-1' }));
  });

  try {
    const result = await runCli([...testCase.args, '--json'], {
      HOME: testHome,
      NOVE_API_URL: server.url,
    });
    if (assertionError) throw assertionError;
    expect(result.code, testCase.name).to.equal(0);
    expect(result.stderr, testCase.name).to.equal('');
    expect(() => JSON.parse(result.stdout), testCase.name).not.to.throw();
  } finally {
    await server.close();
  }
}

async function runEmptyListInvalid(testHome: string, args: string[]): Promise<void> {
  const server = await listen((_request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(
      args[0] === 'user'
        ? { items: [], total: 0, totalPages: 0 }
        : { data: [], total: 0, totalPages: 0 }
    ));
  });
  try {
    const result = await runCli(args, { HOME: testHome, NOVE_API_URL: server.url });
    expect(result.code, args.join(' ')).to.equal(1);
    expect(result.stderr, args.join(' ')).not.to.equal('');
  } finally {
    await server.close();
  }
}

async function runPagedListCase(testHome: string, args: string[], itemKey: 'data' | 'items'): Promise<void> {
  const pages: string[] = [];
  const server = await listen((request, response) => {
    const page = new URL(request.url ?? '/', 'http://localhost').searchParams.get('page') ?? '';
    pages.push(page);
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({
      [itemKey]: [{ id: `id-${page}`, label: page === '1' ? 'Alpha' : 'Zulu' }],
      page: Number(page),
      total: 2,
      totalPages: 2,
    }));
  });
  try {
    const result = await runCli(
      [...args, '--all', '--fields', 'id,label', '--sort', 'label:desc'],
      { HOME: testHome, NOVE_API_URL: server.url }
    );
    expect(result.code, args.join(' ')).to.equal(0);
    expect(pages, args.join(' ')).to.deep.equal(['1', '2']);
    expect(result.stdout.indexOf('id-2'), args.join(' ')).to.be.lessThan(result.stdout.indexOf('id-1'));
    expect(result.stdout, args.join(' ')).to.include('Showing 2 of 2');
  } finally {
    await server.close();
  }
}

describe('full command matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = mkdtempSync(path.join(tmpdir(), 'nove-cli-matrix-'));
    await login(testHome);
  });

  afterEach(() => {
    rmSync(testHome, { force: true, recursive: true });
  });

  it('loads help for every current command and exposes the expected public flag style', async () => {
    const commands = [
      ['auth', 'status'], ['config', 'set'], ['login'], ['logout'],
      ['meeting', 'create'], ['meeting', 'delete'], ['meeting', 'get'], ['meeting', 'list'],
      ['meeting', 'participants'], ['meeting', 'stats'], ['meeting', 'update'],
      ['minute', 'delete'], ['minute', 'get'], ['minute', 'list'],
      ['minute', 'speaker-summary', 'create'], ['minute', 'speaker-summary', 'delete'],
      ['minute', 'speaker-summary', 'get'], ['minute', 'speaker-summary', 'list'],
      ['minute', 'speaker-summary', 'update'], ['minute', 'transcript'],
      ['user', 'create'], ['user', 'delete'], ['user', 'get'], ['user', 'import'],
      ['user', 'list'], ['user', 'update'],
    ];
    const results = await Promise.all(commands.map((command) => runCli([...command, '--help'], { HOME: testHome })));

    for (const [index, result] of results.entries()) {
      expect(result.code, commands[index].join(' ')).to.equal(0);
      expect(result.stderr, commands[index].join(' ')).to.equal('');
      expect(result.stdout, commands[index].join(' ')).not.to.match(/--[a-z]+[A-Z][a-zA-Z-]*/);
    }

    expect(results[3].stdout).not.to.include('Delete a meeting minute');
  });

  it('loads root, topic, and explicit help entry points', async () => {
    const cases = [[], ['help'], ['meeting', '--help'], ['minute', '--help'], ['user', '--help']];
    const results = await Promise.all(cases.map((args) => runCli(args, { HOME: testHome })));
    for (const [index, result] of results.entries()) {
      expect(result.code, cases[index].join(' ') || 'root').to.equal(0);
      expect(result.stderr, cases[index].join(' ') || 'root').to.equal('');
      expect(result.stdout, cases[index].join(' ') || 'root').not.to.equal('');
    }
  });

  it('sends the documented method, path, query, aliases, and payload for every API command', async () => {
    const csv = path.join(testHome, 'matrix-users.csv');
    writeFileSync(csv, 'username,email\nmatrix,matrix@example.test\n');
    const cases: SuccessCase[] = [
      {
        args: ['meeting', 'create', '--platformMeetingId', 'platform-1', '--title', 'Matrix meeting', '--platform', 'OTHER', '--type', 'ONE_TIME', '--startTime', '2026-08-24T09:00:00+08:00', '--endTime', '2026-08-24T10:00:00+08:00', '--duration-seconds', '3600', '--meeting-code', 'code-1'],
        assertRequest: expectRequest('POST', '/meetings', { actualStartAt: '2026-08-24T09:00:00+08:00', durationSeconds: 3600, endedAt: '2026-08-24T10:00:00+08:00', meetingCode: 'code-1', platform: 'OTHER', platformMeetingId: 'platform-1', title: 'Matrix meeting', type: 'ONE_TIME' }),
        name: 'meeting create',
      },
      { args: ['meeting', 'get', 'meeting-1'], assertRequest: expectRequest('GET', '/meetings/meeting-1'), name: 'meeting get' },
      {
        args: ['meeting', 'list', '--page', '2', '--limit', '100', '--platform', 'FEISHU', '--status', 'COMPLETED', '--type', 'SCHEDULED', '--search', 'matrix', '--startDate', '2026-08-24T00:00:00+08:00', '--endDate', '2026-08-25T00:00:00+08:00'],
        assertRequest(request) {
          expectRequest('GET', '/meetings')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ endDate: '2026-08-25T00:00:00+08:00', limit: '100', page: '2', platform: 'FEISHU', search: 'matrix', startDate: '2026-08-24T00:00:00+08:00', status: 'COMPLETED', type: 'SCHEDULED' });
        },
        name: 'meeting list', response: { data: [], page: 2, total: 0, totalPages: 0 },
      },
      {
        args: ['meeting', 'participants', 'meeting-1', '--keyword', 'Alice', '--page', '2', '--limit', '100'],
        assertRequest(request) {
          expectRequest('GET', '/meetings/meeting-1/participants')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ limit: '100', page: '2', search: 'Alice' });
        },
        name: 'meeting participants', response: { data: [], page: 2, total: 0, totalPages: 0 },
      },
      {
        args: ['meeting', 'stats', '--date', '2026-08-24', '--timezone', 'Asia/Shanghai'],
        assertRequest(request) {
          expectRequest('GET', '/meetings/stats/summary')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ endDate: '2026-08-24T16:00:00.000Z', startDate: '2026-08-23T16:00:00.000Z' });
        },
        name: 'meeting stats',
      },
      {
        args: ['meeting', 'update', 'meeting-1', '--actual-start-at', '2026-08-24T09:00:00+08:00', '--ended-at', '2026-08-24T10:00:00+08:00', '--duration-seconds', '3600', '--meeting-code', 'updated', '--participant-count', '4', '--title', 'Updated', '--type', 'RECURRING'],
        assertRequest: expectRequest('PATCH', '/meetings/meeting-1', { actualStartAt: '2026-08-24T09:00:00+08:00', durationSeconds: 3600, endedAt: '2026-08-24T10:00:00+08:00', meetingCode: 'updated', participantCount: 4, title: 'Updated', type: 'RECURRING' }),
        name: 'meeting update',
      },
      { args: ['meeting', 'delete', 'meeting-1', '--yes'], assertRequest: expectRequest('DELETE', '/meetings/meeting-1'), name: 'meeting delete', status: 204 },
      { args: ['minute', 'get', 'minute-1'], assertRequest: expectRequest('GET', '/minutes/minute-1'), name: 'minute get' },
      {
        args: ['minute', 'list', '--meetingId', 'meeting-1', '--source', 'PLATFORM_AUTO', '--page', '2', '--limit', '100'],
        assertRequest(request) {
          expectRequest('GET', '/minutes')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ limit: '100', meetingId: 'meeting-1', page: '2', source: 'PLATFORM_AUTO' });
        },
        name: 'minute list', response: { data: [], page: 2, total: 0, totalPages: 0 },
      },
      { args: ['minute', 'transcript', 'minute-1', '--format', 'json'], assertRequest(request) { expectRequest('GET', '/minutes/minute-1/transcript')(request); expect(request.url.searchParams.get('format')).to.equal('json'); }, name: 'minute transcript' },
      { args: ['minute', 'delete', 'minute-1', '--yes'], assertRequest: expectRequest('DELETE', '/minutes/minute-1'), name: 'minute delete', status: 204 },
      {
        args: ['minute', 'speaker-summary', 'create', 'minute-1', '--platformUserId', 'platform-user-1', '--partSummary', 'Summary', '--keywords', 'alpha', '--keywords', 'beta', '--generatedBy', 'HYBRID', '--aiModel', 'matrix-model'],
        assertRequest: expectRequest('POST', '/minutes/minute-1/speaker-summaries', { aiModel: 'matrix-model', generatedBy: 'HYBRID', keywords: ['alpha', 'beta'], partSummary: 'Summary', platformUserId: 'platform-user-1' }),
        name: 'speaker summary create',
      },
      { args: ['minute', 'speaker-summary', 'get', 'minute-1', 'summary-1'], assertRequest: expectRequest('GET', '/minutes/minute-1/speaker-summaries/summary-1'), name: 'speaker summary get' },
      {
        args: ['minute', 'speaker-summary', 'list', 'minute-1', '--page', '2', '--limit', '100'],
        assertRequest(request) { expectRequest('GET', '/minutes/minute-1/speaker-summaries')(request); expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ limit: '100', page: '2' }); },
        name: 'speaker summary list', response: { data: [], page: 2, total: 0, totalPages: 0 },
      },
      { args: ['minute', 'speaker-summary', 'update', 'minute-1', 'summary-1', '--partSummary', 'Updated', '--keywords', 'gamma'], assertRequest: expectRequest('PUT', '/minutes/minute-1/speaker-summaries/summary-1', { keywords: ['gamma'], partSummary: 'Updated' }), name: 'speaker summary update' },
      { args: ['minute', 'speaker-summary', 'delete', 'minute-1', 'summary-1', '--yes'], assertRequest: expectRequest('DELETE', '/minutes/minute-1/speaker-summaries/summary-1'), name: 'speaker summary delete', status: 204 },
      {
        args: ['user', 'create', '--username', 'matrix_user', '--email', 'matrix@example.test', '--phone', '13800138000', '--countryCode', '+86', '--displayName', 'Matrix User', '--firstName', 'Matrix', '--lastName', 'User', '--active', '--gender', 'OTHER', '--dateOfBirth', '2000-02-29', '--avatar', 'https://example.test/avatar.png', '--bio', 'bio', '--address', 'address', '--city', 'city', '--country', 'country', '--website', 'https://example.test', '--zipCode', '200000'],
        assertRequest: expectRequest('POST', '/admin/users', { active: true, address: 'address', avatar: 'https://example.test/avatar.png', bio: 'bio', city: 'city', country: 'country', countryCode: '+86', dateOfBirth: '2000-02-29', displayName: 'Matrix User', email: 'matrix@example.test', firstName: 'Matrix', gender: 'OTHER', lastName: 'User', phone: '13800138000', username: 'matrix_user', website: 'https://example.test', zipCode: '200000' }),
        name: 'user create',
      },
      { args: ['user', 'get', 'user-1'], assertRequest: expectRequest('GET', '/admin/users/user-1'), name: 'user get' },
      {
        args: ['user', 'list', '--keyword', 'matrix', '--no-active', '--page', '2', '--limit', '100', '--sortBy', 'email', '--sortOrder', 'asc'],
        assertRequest(request) { expectRequest('GET', '/admin/users')(request); expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ active: 'false', keyword: 'matrix', page: '2', pageSize: '100', sortBy: 'email', sortOrder: 'asc' }); },
        name: 'user list', response: { items: [], page: 2, total: 0, totalPages: 0 },
      },
      { args: ['user', 'update', 'user-1', '--display-name', 'Updated', '--no-active', '--website', 'https://example.test/new'], assertRequest: expectRequest('PATCH', '/admin/users/user-1', { active: false, displayName: 'Updated', website: 'https://example.test/new' }), name: 'user update' },
      { args: ['user', 'delete', 'user-1', '--yes'], assertRequest: expectRequest('DELETE', '/admin/users/user-1'), name: 'user delete', status: 204 },
      {
        args: ['user', 'import', '--file', csv],
        assertRequest(request) { expectRequest('POST', '/admin/users/import')(request); expect(request.headers['content-type']).to.match(/^multipart\/form-data; boundary=/); expect(request.body).to.include('matrix-users.csv'); },
        name: 'user import', response: { failureCount: 0, successCount: 1, total: 1 },
      },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });

  it('returns structured errors for missing arguments and required flags on every command family', async () => {
    const cases = [
      ['config', 'set', '--json'], ['meeting', 'create', '--json'], ['meeting', 'get', '--json'],
      ['meeting', 'participants', '--json'], ['meeting', 'update', '--json'], ['minute', 'get', '--json'],
      ['minute', 'transcript', '--json'], ['minute', 'speaker-summary', 'create', '--json'],
      ['minute', 'speaker-summary', 'get', '--json'], ['minute', 'speaker-summary', 'update', '--json'],
      ['user', 'import', '--json'], ['user', 'get', '--json'], ['user', 'update', '--json'],
    ];

    const results = await Promise.all(cases.map((args) => runCli(args, { HOME: testHome })));
    for (const [index, result] of results.entries()) {
      const args = cases[index];
      expect(result.code, args.join(' ')).to.equal(2);
      expect(result.stdout, args.join(' ')).to.equal('');
      expect(JSON.parse(result.stderr), args.join(' ')).to.include({ code: 'CLI_USAGE_ERROR' });
    }
  });

  it('rejects every enum family, integer boundary, date conflict, and malformed user field before HTTP', async () => {
    const cases = [
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'INVALID', '--type', 'ONE_TIME', '--json'],
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'OTHER', '--type', 'INVALID', '--json'],
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'OTHER', '--type', 'ONE_TIME', '--duration-seconds', '-1', '--json'],
      ['meeting', 'list', '--status', 'INVALID', '--json'], ['meeting', 'list', '--page', '0', '--json'],
      ['meeting', 'list', '--limit', '101', '--json'], ['meeting', 'list', '--all', '--page', '2', '--json'],
      ['meeting', 'update', 'id', '--participant-count', '-1', '--json'],
      ['minute', 'list', '--source', 'INVALID', '--json'],
      ['minute', 'speaker-summary', 'create', 'id', '--platform-user-id', 'u', '--part-summary', 's', '--generated-by', 'INVALID', '--json'],
      ['minute', 'transcript', 'id', '--format', 'xml', '--json'], ['user', 'create', '--gender', 'INVALID', '--json'],
      ['user', 'list', '--sort-by', 'INVALID', '--json'], ['user', 'list', '--sort-order', 'INVALID', '--json'],
    ];
    const results = await Promise.all(cases.map((args) =>
      runCli(args, { HOME: testHome, NOVE_API_URL: 'http://127.0.0.1:1' })
    ));
    for (const [index, result] of results.entries()) {
      const args = cases[index];
      expect(result.code, args.join(' ')).to.equal(2);
      expect(JSON.parse(result.stderr), args.join(' ')).to.include({ code: 'CLI_USAGE_ERROR' });
    }

    const localCases = [
      ['meeting', 'stats', '--date', '2026-02-30', '--json'],
      ['meeting', 'list', '--fields', 'id', '--json'], ['meeting', 'list', '--sort', 'id:asc', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--start-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--start-date', '2026-08-25T00:00:00Z', '--end-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--timezone', 'Mars/Olympus', '--json'],
      ['user', 'create', '--email', 'bad', '--json'], ['user', 'create', '--username', 'bad-name', '--json'],
      ['user', 'create', '--phone', 'abc', '--country-code', '+86', '--json'],
      ['user', 'create', '--phone', '13800138000', '--json'], ['user', 'create', '--country-code', '++++', '--json'],
      ['user', 'create', '--email', 'ok@example.test', '--avatar', 'file:///tmp/avatar', '--json'],
      ['user', 'create', '--email', 'ok@example.test', '--website', 'not-a-url', '--json'],
      ['user', 'create', '--email', 'ok@example.test', '--date-of-birth', '2025-02-29', '--json'],
    ];
    const localResults = await Promise.all(localCases.map((args) =>
      runCli(args, { HOME: testHome, NOVE_API_URL: 'http://127.0.0.1:1' })
    ));
    for (const [index, result] of localResults.entries()) {
      const args = localCases[index];
      expect(result.code, args.join(' ')).to.equal(1);
      expect(JSON.parse(result.stderr), args.join(' ')).to.include({ code: 'CLI_ERROR' });
    }
  });

  it('validates all list presentation flags even when the API returns no rows', async () => {
    const invalidFlags = [
      ['meeting', 'list', '--fields', ','], ['meeting', 'list', '--sort', 'id:sideways'],
      ['minute', 'list', '--fields', ','], ['minute', 'list', '--sort', 'id:sideways'],
      ['minute', 'speaker-summary', 'list', 'minute-1', '--fields', ','],
      ['meeting', 'participants', 'meeting-1', '--sort', 'id:sideways'],
      ['user', 'list', '--sort', 'id:sideways'],
    ];
    await Promise.all(invalidFlags.map((args) => runEmptyListInvalid(testHome, args)));
  });

  it('fetches, merges, selects, and sorts every paginated resource family', async () => {
    await Promise.all([
      runPagedListCase(testHome, ['meeting', 'list'], 'data'),
      runPagedListCase(testHome, ['meeting', 'participants', 'meeting-1'], 'data'),
      runPagedListCase(testHome, ['minute', 'list'], 'data'),
      runPagedListCase(testHome, ['minute', 'speaker-summary', 'list', 'minute-1'], 'data'),
      runPagedListCase(testHome, ['user', 'list'], 'items'),
    ]);
  });

  it('keeps auth and configuration operations isolated, idempotent, and secret-free', async () => {
    const status = await runCli(['auth', 'status', '--json'], { HOME: testHome });
    expect(JSON.parse(status.stdout)).to.include({ authenticated: true });
    expect(status.stdout).not.to.include(apiKey);

    const conflict = await runCli(['login', '--api-key-stdin', '--json'], {
      HOME: testHome,
      NOVE_API_KEY: 'another-key',
    }, 'stdin-key\n');
    expect(conflict.code).to.equal(1);
    expect(conflict.stdout).to.equal('');
    expect(conflict.stderr).not.to.include('another-key');
    expect(conflict.stderr).not.to.include('stdin-key');

    const invalidConfig = await runCli(['config', 'set', 'base-url', 'ftp://example.test', '--json'], { HOME: testHome });
    expect(invalidConfig.code).to.equal(1);
    expect(JSON.parse(invalidConfig.stderr)).to.include({ code: 'CLI_ERROR' });

    const unknownConfig = await runCli(['config', 'set', 'api-url', 'https://example.test', '--json'], { HOME: testHome });
    expect(unknownConfig.code).to.equal(1);
    expect(JSON.parse(unknownConfig.stderr)).to.include({ code: 'CLI_ERROR' });

    const validConfig = await runCli(
      ['config', 'set', 'base-url', 'https://example.test/api/', '--json'],
      { HOME: testHome }
    );
    expect(validConfig.code).to.equal(0);
    expect(JSON.parse(validConfig.stdout)).to.deep.equal({ baseUrl: 'https://example.test/api/' });

    expect((await runCli(['logout', '--json'], { HOME: testHome })).code).to.equal(0);
    expect(JSON.parse((await runCli(['logout', '--json'], { HOME: testHome })).stdout)).to.deep.equal({ authenticated: false, removed: false });
  });
});
