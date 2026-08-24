import { expect } from 'chai';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { listen } from '../helpers/http-server.js';

describe('user import command contract', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-user-import-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('reports partial user imports without claiming complete success', async () => {
    const file = path.join(testHome, 'users.csv');
    writeFileSync(file, 'username,email\nvalid,valid@example.test\n');
    const server = await listen((_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({
        failureCount: 1,
        failures: [{ code: 'INVALID_DATA', row: 2 }],
        successCount: 0,
        total: 1,
      }));
    });

    try {
      const result = await runCli(['user', 'import', '--file', file], {
        HOME: testHome,
        NOVE_API_URL: server.url,
      });
      expect(result.code).to.equal(0);
      expect(result.stdout).to.include('User import completed with 1 failed row.');
      expect(result.stdout).not.to.include('Users imported successfully.');
      expect(result.stdout).to.include('"failureCount": 1');
    } finally {
      await server.close();
    }
  });
});
