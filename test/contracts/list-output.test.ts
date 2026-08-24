import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { listen } from '../helpers/http-server.js';

describe('list output contracts', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-list-output-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('rejects unknown table fields and table-only flags in JSON mode', async () => {
    let requests = 0;
    const server = await listen((_request, response) => {
      requests++;
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({
        data: [{ id: 'meeting-1', title: 'Contract test' }],
        page: 1,
        total: 1,
        totalPages: 1,
      }));
    });
    const environment = { HOME: testHome, NOVE_API_URL: server.url };

    try {
      const fields = await runCli(['meeting', 'list', '--fields', 'typoField'], environment);
      expect(fields.code).to.equal(1);
      expect(fields.stderr).to.include('--fields references an unknown field: typoField.');

      const sort = await runCli(['meeting', 'list', '--sort', 'typoField'], environment);
      expect(sort.code).to.equal(1);
      expect(sort.stderr).to.include('--sort references an unknown field: typoField.');

      const jsonFields = await runCli(
        ['meeting', 'list', '--fields', 'id', '--json'],
        environment,
      );
      expect(jsonFields.code).to.equal(1);
      expect(JSON.parse(jsonFields.stderr)).to.include({ code: 'CLI_ERROR' });
      expect(JSON.parse(jsonFields.stderr).message).to.include('only available for table output');
      expect(requests).to.equal(2);
    } finally {
      await server.close();
    }
  });

  it('fetches all pages and renders selected, sorted table fields', async () => {
    const requestedPages: string[] = [];
    const server = await listen((request, response) => {
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
    });

    try {
      const result = await runCli(
        ['meeting', 'list', '--all', '--fields', 'id,title', '--sort', 'title:desc'],
        { HOME: testHome, NOVE_API_URL: server.url },
      );
      expect(result.code).to.equal(0);
      expect(requestedPages).to.deep.equal(['1', '2']);
      expect(result.stdout).to.include('id');
      expect(result.stdout).to.include('meeting-2');
      expect(result.stdout.indexOf('meeting-2')).to.be.lessThan(result.stdout.indexOf('meeting-1'));
      expect(result.stdout).to.include('Showing 2 of 2 meetings.');
    } finally {
      await server.close();
    }
  });

  it('shows a clear empty-list message outside JSON mode', async () => {
    const server = await listen((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ data: [], page: 1, total: 0, totalPages: 0 }));
    });

    try {
      const result = await runCli(['meeting', 'list'], {
        HOME: testHome,
        NOVE_API_URL: server.url,
      });
      expect(result.code).to.equal(0);
      expect(result.stdout).to.equal('No meetings found.\n');
    } finally {
      await server.close();
    }
  });
});
