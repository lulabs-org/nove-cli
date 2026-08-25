import { expect } from 'chai';

import { loginWithApiKey, TEST_API_KEY } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';

describe('authentication and configuration command matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-auth-config-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('keeps auth and configuration operations isolated, idempotent, and secret-free', async () => {
    const status = await runCli(['auth', 'status', '--json'], { HOME: testHome });
    expect(JSON.parse(status.stdout)).to.include({ authenticated: true });
    expect(status.stdout).not.to.include(TEST_API_KEY);

    const conflict = await runCli(['login', '--api-key-stdin', '--json'], {
      HOME: testHome,
      NOVE_API_KEY: 'another-key',
    }, 'stdin-key\n');
    expect(conflict.code).to.equal(1);
    expect(conflict.stdout).to.equal('');
    expect(conflict.stderr).not.to.include('another-key');
    expect(conflict.stderr).not.to.include('stdin-key');

    const invalidConfig = await runCli(
      ['config', 'set', 'base-url', 'ftp://example.test', '--json'],
      { HOME: testHome },
    );
    expect(invalidConfig.code).to.equal(1);
    expect(JSON.parse(invalidConfig.stderr)).to.include({ code: 'CLI_ERROR' });

    const unknownConfig = await runCli(
      ['config', 'set', 'api-url', 'https://example.test', '--json'],
      { HOME: testHome },
    );
    expect(unknownConfig.code).to.equal(1);
    expect(JSON.parse(unknownConfig.stderr)).to.include({ code: 'CLI_ERROR' });

    const validConfig = await runCli(
      ['config', 'set', 'base-url', 'https://example.test/api/', '--json'],
      { HOME: testHome },
    );
    expect(validConfig.code).to.equal(0);
    expect(JSON.parse(validConfig.stdout)).to.deep.equal({ baseUrl: 'https://example.test/api/' });

    expect((await runCli(['logout', '--json'], { HOME: testHome })).code).to.equal(0);
    expect(JSON.parse((await runCli(['logout', '--json'], { HOME: testHome })).stdout)).to.deep.equal({
      authenticated: false,
      removed: false,
    });
  });
});
