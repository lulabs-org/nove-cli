import { expect } from 'chai';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface CliResult {
  code: null | number;
  stderr: string;
  stdout: string;
}

function runCli(args: string[], environment: NodeJS.ProcessEnv): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['bin/run.js', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, ...environment, NO_COLOR: '1', NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
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
  });
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
    const login = await runCli(['login', '--api-key', 'test-key', '--json'], environment);
    expect(login.code).to.equal(0);
    expect(JSON.parse(login.stdout)).to.deep.equal({ authenticated: true });
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

    /* eslint-disable no-await-in-loop */
    for (const testCase of cases) {
      const protectedResult = await runCli([...testCase.args, '--json'], { HOME: testHome });
      expect(protectedResult.code).to.equal(1);
      expect(protectedResult.stdout).to.equal('');
      expect(JSON.parse(protectedResult.stderr)).to.include({ code: 'CLI_ERROR' });

      const dryRunResult = await runCli([...testCase.args, '--dry-run', '--json'], {
        HOME: testHome,
      });
      expect(dryRunResult.code).to.equal(0);
      expect(dryRunResult.stderr).to.equal('');
      expect(JSON.parse(dryRunResult.stdout)).to.include({
        dryRun: true,
        resource: testCase.resource,
      });
    }
    /* eslint-enable no-await-in-loop */
  });

  it('allows --yes deletion and renders 204 as JSON null', async () => {
    const environment = { HOME: testHome };
    const login = await runCli(['login', '--api-key', 'test-key', '--json'], environment);
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
    const login = await runCli(['login', '--api-key', 'test-key', '--json'], environment);
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
    const login = await runCli(['login', '--api-key', 'test-key', '--json'], environment);
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
      message: 'No update parameters provided. Use --title or --status.',
    });
  });
});
