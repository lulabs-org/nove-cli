import { expect } from 'chai';
import { createServer, type Server } from 'node:http';

import { loginWithApiKey, TEST_API_KEY } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';

describe('output and safety contracts', () => {
  let testHome: string;

  beforeEach(() => {
    testHome = createTestHome('nove-cli-contract-');
  });

  afterEach(() => {
    removeTestHome(testHome);
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
      ['minute', 'user-transcripts'],
      ['minute', 'speaker-summary', 'create'],
      ['minute', 'speaker-summary', 'delete'],
      ['minute', 'speaker-summary', 'get'],
      ['minute', 'speaker-summary', 'list'],
      ['minute', 'speaker-summary', 'update'],
      ['minute', 'transcript'],
      ['minute', 'transcript-context'],
      ['order', 'create'], ['order', 'delete'], ['order', 'get'], ['order', 'list'],
      ['order', 'status'], ['order', 'update'],
      ['product', 'create'], ['product', 'delete'], ['product', 'get'], ['product', 'list'],
      ['product', 'status'], ['product', 'update'],
      ['project', 'create'], ['project', 'delete'], ['project', 'get'], ['project', 'list'],
      ['project', 'status'], ['project', 'update'],
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
    await loginWithApiKey(testHome);

    const server: Server = createServer((request, response) => {
      expect(request.headers['x-api-key']).to.equal(TEST_API_KEY);
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
      { args: ['order', 'delete', 'order-1'], resource: 'order' },
      { args: ['product', 'delete', 'product-1'], resource: 'product' },
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
    await loginWithApiKey(testHome);

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

  it('keeps stdout clean and emits structured API errors to stderr', async () => {
    const environment = { HOME: testHome };
    await loginWithApiKey(testHome);

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
});
