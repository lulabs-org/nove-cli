import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { listen } from '../helpers/http-server.js';

describe('command validation contracts', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-validation-command-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('forwards pagination and half-open date filters exactly', async () => {
    let receivedUrl = '';
    const server = await listen((request, response) => {
      receivedUrl = request.url ?? '';
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ data: [], totalPages: 0 }));
    });

    try {
      const result = await runCli(
        [
          'meeting', 'list', '--page', '3', '--limit', '50',
          '--startDate', '2026-08-24T00:00:00+08:00',
          '--endDate', '2026-08-25T00:00:00+08:00', '--json',
        ],
        { HOME: testHome, NOVE_API_URL: server.url },
      );
      expect(result.code).to.equal(0);
      expect(JSON.parse(result.stdout)).to.deep.equal({ data: [], totalPages: 0 });
      const query = new URL(receivedUrl, 'http://localhost').searchParams;
      expect(query.get('page')).to.equal('3');
      expect(query.get('limit')).to.equal('50');
      expect(query.get('startDate')).to.equal('2026-08-24T00:00:00+08:00');
      expect(query.get('endDate')).to.equal('2026-08-25T00:00:00+08:00');
    } finally {
      await server.close();
    }
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
});
