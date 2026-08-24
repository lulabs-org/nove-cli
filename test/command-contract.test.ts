import { expect } from 'chai';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface CliResult {
  code: null | number;
  stderr: string;
  stdout: string;
}

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

async function loginCli(
  environment: NodeJS.ProcessEnv,
  apiKey = 'test-key',
  source: 'environment' | 'stdin' = 'environment',
  validationStatus = 200
): Promise<CliResult> {
  const server: Server = createServer((request, response) => {
    expect(request.url).to.equal('/api/auth/api-key/validate');
    expect(request.headers['x-api-key']).to.equal(apiKey);
    response.statusCode = validationStatus;
    response.setHeader('content-type', 'application/json');
    response.end(
      JSON.stringify(
        validationStatus === 200
          ? { authenticated: true }
          : { message: 'Invalid API key' }
      )
    );
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

  try {
    return await runCli(
      ['login', ...(source === 'stdin' ? ['--api-key-stdin'] : []), '--json'],
      {
        ...environment,
        ...(source === 'environment' ? { NOVE_API_KEY: apiKey } : {}),
        NOVE_API_URL: `http://127.0.0.1:${address.port}`,
      },
      source === 'stdin' ? `${apiKey}\n` : ''
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe('command contracts', () => {
  let testHome: string;

  beforeEach(() => {
    testHome = mkdtempSync(path.join(tmpdir(), 'nove-cli-command-'));
  });

  afterEach(() => {
    rmSync(testHome, { force: true, recursive: true });
  });

  it('exposes --json on every API data command', async () => {
    const commandArguments = [
      ['meeting', 'create'],
      ['meeting', 'delete'],
      ['meeting', 'get'],
      ['meeting', 'list'],
      ['meeting', 'participants'],
      ['meeting', 'stats'],
      ['meeting', 'update'],
      ['minute', 'delete'],
      ['minute', 'get'],
      ['minute', 'list'],
      ['minute', 'speaker-summary', 'create'],
      ['minute', 'speaker-summary', 'delete'],
      ['minute', 'speaker-summary', 'get'],
      ['minute', 'speaker-summary', 'list'],
      ['minute', 'speaker-summary', 'update'],
      ['minute', 'transcript'],
      ['user', 'create'],
      ['user', 'delete'],
      ['user', 'get'],
      ['user', 'import'],
      ['user', 'list'],
      ['user', 'update'],
    ];

    const results = await Promise.all(
      commandArguments.map((args) => runCli([...args, '--help'], { HOME: testHome }))
    );

    for (const [index, result] of results.entries()) {
      expect(result.code, commandArguments[index].join(' ')).to.equal(0);
      expect(result.stdout, commandArguments[index].join(' ')).to.include('--json');
    }
  });

  it('emits exactly one JSON value on stdout in --json mode', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment);
    expect(login.code).to.equal(0);
    expect(JSON.parse(login.stdout)).to.include({ authenticated: true });
    expect(login.stderr).to.equal('');

    const server: Server = createServer((request, response) => {
      expect(request.headers['x-api-key']).to.equal('test-key');
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ id: 'meeting-1', title: 'Contract test' }));
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(['meeting', 'get', 'meeting-1', '--json'], {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    });

    expect(result.code).to.equal(0);
    expect(result.stderr).to.equal('');
    expect(result.stdout.trim().split('\n')).to.have.length(1);
    expect(JSON.parse(result.stdout)).to.deep.equal({ id: 'meeting-1', title: 'Contract test' });
  });

  it('protects every delete command and supports machine-readable dry runs', async () => {
    const cases = [
      { args: ['meeting', 'delete', 'meeting-1'], resource: 'meeting' },
      { args: ['minute', 'delete', 'minute-1'], resource: 'minute' },
      { args: ['user', 'delete', 'user-1'], resource: 'user' },
      {
        args: ['minute', 'speaker-summary', 'delete', 'minute-1', 'summary-1'],
        resource: 'speaker-summary',
      },
    ];

    const results = await Promise.all(cases.map(async (testCase) => ({
      dryRunResult: await runCli([...testCase.args, '--dry-run', '--json'], { HOME: testHome }),
      protectedResult: await runCli([...testCase.args, '--json'], { HOME: testHome }),
      testCase,
    })));

    for (const { dryRunResult, protectedResult, testCase } of results) {
      expect(protectedResult.code).to.equal(1);
      expect(protectedResult.stdout).to.equal('');
      expect(JSON.parse(protectedResult.stderr)).to.include({ code: 'CLI_ERROR' });

      expect(dryRunResult.code).to.equal(0);
      expect(dryRunResult.stderr).to.equal('');
      expect(JSON.parse(dryRunResult.stdout)).to.include({
        dryRun: true,
        resource: testCase.resource,
      });
    }
  });

  it('allows --yes deletion and renders 204 as JSON null', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment);
    expect(login.code).to.equal(0);

    const server: Server = createServer((request, response) => {
      expect(request.method).to.equal('DELETE');
      response.statusCode = 204;
      response.end();
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(['meeting', 'delete', 'meeting-1', '--yes', '--json'], {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    });

    expect(result.code).to.equal(0);
    expect(result.stderr).to.equal('');
    expect(result.stdout).to.equal('null\n');
  });

  it('forwards pagination and half-open date filters exactly', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment);
    expect(login.code).to.equal(0);

    let receivedUrl = '';
    const server: Server = createServer((request, response) => {
      receivedUrl = request.url ?? '';
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ data: [], totalPages: 0 }));
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(
      [
        'meeting',
        'list',
        '--page',
        '3',
        '--limit',
        '50',
        '--startDate',
        '2026-08-24T00:00:00+08:00',
        '--endDate',
        '2026-08-25T00:00:00+08:00',
        '--json',
      ],
      {
        ...environment,
        NOVE_API_URL: `http://127.0.0.1:${address.port}`,
      }
    );

    expect(result.code).to.equal(0);
    expect(JSON.parse(result.stdout)).to.deep.equal({ data: [], totalPages: 0 });
    const query = new URL(receivedUrl, 'http://localhost').searchParams;
    expect(query.get('page')).to.equal('3');
    expect(query.get('limit')).to.equal('50');
    expect(query.get('startDate')).to.equal('2026-08-24T00:00:00+08:00');
    expect(query.get('endDate')).to.equal('2026-08-25T00:00:00+08:00');
  });

  it('keeps stdout clean and emits structured API errors to stderr', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment);
    expect(login.code).to.equal(0);

    const server: Server = createServer((_request, response) => {
      response.statusCode = 403;
      response.setHeader('content-type', 'application/json');
      response.setHeader('x-request-id', 'request-command-1');
      response.end(JSON.stringify({ message: 'Forbidden by policy' }));
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(['meeting', 'get', 'meeting-1', '--json'], {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    });

    expect(result.code).to.equal(1);
    expect(result.stdout).to.equal('');
    expect(JSON.parse(result.stderr)).to.deep.equal({
      code: 'API_PERMISSION_ERROR',
      details: { message: 'Forbidden by policy' },
      message: 'Forbidden by policy',
      requestId: 'request-command-1',
      status: 403,
    });
  });

  it('uses the JSON error contract for local command validation', async () => {
    const result = await runCli(['meeting', 'update', 'meeting-1', '--json'], {
      HOME: testHome,
    });

    expect(result.code).to.equal(1);
    expect(result.stdout).to.equal('');
    expect(JSON.parse(result.stderr)).to.deep.equal({
      code: 'CLI_ERROR',
      message: 'No fields provided to update.',
    });
  });

  it('supports secure stdin login, status inspection, and logout without exposing the key', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment, 'stdin-test-key', 'stdin');
    expect(login.code).to.equal(0);
    expect(login.stdout).not.to.include('stdin-test-key');
    expect(JSON.parse(login.stdout)).to.include({ authenticated: true });

    const status = await runCli(['auth', 'status', '--json'], environment);
    expect(status.code).to.equal(0);
    expect(status.stdout).not.to.include('stdin-test-key');
    expect(JSON.parse(status.stdout)).to.include({ authenticated: true });

    const logout = await runCli(['logout', '--json'], environment);
    expect(JSON.parse(logout.stdout)).to.deep.equal({ authenticated: false, removed: true });
    const loggedOutStatus = await runCli(['auth', 'status', '--json'], environment);
    expect(JSON.parse(loggedOutStatus.stdout)).to.deep.equal({ authenticated: false });
  });

  it('supports NOVE_API_KEY and rejects the removed --api-key argument', async () => {
    const environment = { HOME: testHome };
    const login = await loginCli(environment, 'environment-test-key');
    expect(login.code).to.equal(0);
    expect(login.stdout).not.to.include('environment-test-key');

    const help = await runCli(['login', '--help'], { HOME: testHome });
    expect(help.stdout).to.include('--api-key-stdin');
    expect(help.stdout).not.to.match(/--api-key=<value>/);

    const removedArgument = await runCli(['login', '--api-key', 'test-key', '--json'], {
      HOME: testHome,
    });
    expect(removedArgument.code).to.equal(2);
    expect(JSON.parse(removedArgument.stderr)).to.include({ code: 'CLI_USAGE_ERROR' });
    expect(JSON.parse(removedArgument.stderr).message).to.include('Nonexistent flag: --api-key');

    expect((await runCli(['logout', '--json'], environment)).code).to.equal(0);
    const invalidLogin = await loginCli(environment, 'invalid-test-key', 'environment', 401);
    expect(invalidLogin.code).to.equal(1);
    expect(invalidLogin.stdout).to.equal('');
    expect(JSON.parse(invalidLogin.stderr)).to.include({
      code: 'API_AUTHENTICATION_ERROR',
      status: 401,
    });
    const status = await runCli(['auth', 'status', '--json'], environment);
    expect(JSON.parse(status.stdout)).to.deep.equal({ authenticated: false });
  });

  it('rejects invalid pagination, enum, user, and import inputs before requests', async () => {
    const invalidPage = await runCli(['meeting', 'list', '--page', '0', '--json'], { HOME: testHome });
    expect(invalidPage.code).to.equal(2);
    expect(JSON.parse(invalidPage.stderr)).to.include({ code: 'CLI_USAGE_ERROR' });
    expect(JSON.parse(invalidPage.stderr).message).to.include('Expected an integer greater than or equal to 1');

    const invalidSource = await runCli(['minute', 'list', '--source', 'UPLOAD', '--json'], { HOME: testHome });
    expect(invalidSource.code).to.equal(2);
    expect(JSON.parse(invalidSource.stderr)).to.include({ code: 'CLI_USAGE_ERROR' });
    expect(JSON.parse(invalidSource.stderr).message).to.include('Expected --source=UPLOAD to be one of');

    const invalidEmail = await runCli(['user', 'create', '--email', 'invalid', '--json'], {
      HOME: testHome,
    });
    expect(invalidEmail.code).to.equal(1);
    expect(JSON.parse(invalidEmail.stderr)).to.include({ code: 'CLI_ERROR', message: 'Email address is invalid.' });

    const invalidFile = await runCli(['user', 'import', '--file', 'users.json', '--json'], {
      HOME: testHome,
    });
    expect(invalidFile.code).to.equal(1);
    expect(JSON.parse(invalidFile.stderr)).to.include({ code: 'CLI_ERROR' });
  });

  it('rejects unknown table fields and table-only flags in JSON mode', async () => {
    const environment = { HOME: testHome };
    expect((await loginCli(environment)).code).to.equal(0);
    let requests = 0;
    const server: Server = createServer((_request, response) => {
      requests++;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({
        data: [{ id: 'meeting-1', title: 'Contract test' }],
        page: 1,
        total: 1,
        totalPages: 1,
      }));
      if (requests === 2) server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
    const apiEnvironment = {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    };

    const fields = await runCli(['meeting', 'list', '--fields', 'typoField'], apiEnvironment);
    expect(fields.code).to.equal(1);
    expect(fields.stderr).to.include('--fields references an unknown field: typoField.');

    const sort = await runCli(['meeting', 'list', '--sort', 'typoField'], apiEnvironment);
    expect(sort.code).to.equal(1);
    expect(sort.stderr).to.include('--sort references an unknown field: typoField.');

    const jsonFields = await runCli(
      ['meeting', 'list', '--fields', 'id', '--json'],
      apiEnvironment
    );
    expect(jsonFields.code).to.equal(1);
    expect(JSON.parse(jsonFields.stderr)).to.include({ code: 'CLI_ERROR' });
    expect(JSON.parse(jsonFields.stderr).message).to.include('only available for table output');
    expect(requests).to.equal(2);
  });

  it('reports partial user imports without claiming complete success', async () => {
    const environment = { HOME: testHome };
    expect((await loginCli(environment)).code).to.equal(0);
    const file = path.join(testHome, 'users.csv');
    writeFileSync(file, 'username,email\nvalid,valid@example.test\n');
    const server: Server = createServer((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({
        failureCount: 1,
        failures: [{ code: 'INVALID_DATA', row: 2 }],
        successCount: 0,
        total: 1,
      }));
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(['user', 'import', '--file', file], {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    });

    expect(result.code).to.equal(0);
    expect(result.stdout).to.include('User import completed with 1 failed row.');
    expect(result.stdout).not.to.include('Users imported successfully.');
    expect(result.stdout).to.include('"failureCount": 1');
  });

  it('fetches all pages and renders selected, sorted table fields', async () => {
    const environment = { HOME: testHome };
    expect((await loginCli(environment)).code).to.equal(0);
    const requestedPages: string[] = [];
    const server: Server = createServer((request, response) => {
      const page = new URL(request.url ?? '', 'http://localhost').searchParams.get('page') ?? '';
      requestedPages.push(page);
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({
        data: [{ id: `meeting-${page}`, title: page === '1' ? 'Alpha' : 'Zulu' }],
        limit: 10,
        page: Number(page),
        total: 2,
        totalPages: 2,
      }));
      if (page === '2') server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(
      ['meeting', 'list', '--all', '--fields', 'id,title', '--sort', 'title:desc'],
      { ...environment, NOVE_API_URL: `http://127.0.0.1:${address.port}` }
    );

    expect(result.code).to.equal(0);
    expect(requestedPages).to.deep.equal(['1', '2']);
    expect(result.stdout).to.include('id');
    expect(result.stdout).to.include('meeting-2');
    expect(result.stdout.indexOf('meeting-2')).to.be.lessThan(result.stdout.indexOf('meeting-1'));
    expect(result.stdout).to.include('Showing 2 of 2 meetings.');
  });

  it('shows a clear empty-list message outside JSON mode', async () => {
    const environment = { HOME: testHome };
    expect((await loginCli(environment)).code).to.equal(0);
    const server: Server = createServer((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ data: [], page: 1, total: 0, totalPages: 0 }));
      server.close();
    });
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');

    const result = await runCli(['meeting', 'list'], {
      ...environment,
      NOVE_API_URL: `http://127.0.0.1:${address.port}`,
    });
    expect(result.code).to.equal(0);
    expect(result.stdout).to.equal('No meetings found.\n');
  });
});
