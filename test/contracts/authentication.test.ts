import { expect } from 'chai';

import { runApiKeyLogin } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';

describe('authentication command contracts', () => {
  let testHome: string;

  beforeEach(() => {
    testHome = createTestHome('nove-cli-auth-command-');
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('supports secure stdin login, status inspection, and logout without exposing the key', async () => {
    const environment = { HOME: testHome };
    const login = await runApiKeyLogin(environment, {
      apiKey: 'stdin-test-key',
      source: 'stdin',
    });
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
    const login = await runApiKeyLogin(environment, {
      apiKey: 'environment-test-key',
      explicitMethod: true,
    });
    expect(login.code).to.equal(0);
    expect(login.stdout).not.to.include('environment-test-key');

    const help = await runCli(['login', '--help'], environment);
    expect(help.stdout).to.include('--api-key-stdin');
    expect(help.stdout).to.include('--method=<option>');
    expect(help.stdout).to.include('oauth|api-key');
    expect(help.stdout).not.to.match(/--api-key=<value>/);

    const removedArgument = await runCli(['login', '--api-key', 'test-key', '--json'], environment);
    expect(removedArgument.code).to.equal(2);
    expect(JSON.parse(removedArgument.stderr)).to.include({ code: 'CLI_USAGE_ERROR' });
    expect(JSON.parse(removedArgument.stderr).message).to.include('Nonexistent flag: --api-key');

    expect((await runCli(['logout', '--json'], environment)).code).to.equal(0);
    const invalidLogin = await runApiKeyLogin(environment, {
      apiKey: 'invalid-test-key',
      validationStatus: 401,
    });
    expect(invalidLogin.code).to.equal(1);
    expect(invalidLogin.stdout).to.equal('');
    expect(JSON.parse(invalidLogin.stderr)).to.include({
      code: 'API_AUTHENTICATION_ERROR',
      status: 401,
    });
    const status = await runCli(['auth', 'status', '--json'], environment);
    expect(JSON.parse(status.stdout)).to.deep.equal({ authenticated: false });
  });

  it('requires an explicit login method outside a terminal and rejects mixed method flags', async () => {
    const environment = { HOME: testHome };
    const missingMethod = await runCli(['login', '--json'], environment);
    expect(missingMethod.code).to.equal(1);
    expect(missingMethod.stdout).to.equal('');
    expect(JSON.parse(missingMethod.stderr)).to.deep.include({
      code: 'CLI_ERROR',
      message: 'Login method is required in a non-interactive environment. Use --method oauth or --method api-key.',
    });

    const missingApiKey = await runCli(['login', '--method', 'api-key', '--json'], environment);
    expect(missingApiKey.code).to.equal(1);
    expect(missingApiKey.stdout).to.equal('');
    expect(JSON.parse(missingApiKey.stderr)).to.deep.include({
      code: 'CLI_ERROR',
      message: 'API Key is required. Enter it interactively, set NOVE_API_KEY, or use --api-key-stdin.',
    });

    const apiKeyWithOAuthFlag = await runCli(
      ['login', '--method', 'api-key', '--no-browser', '--json'],
      environment,
    );
    expect(apiKeyWithOAuthFlag.code).to.equal(1);
    expect(JSON.parse(apiKeyWithOAuthFlag.stderr)).to.deep.include({
      code: 'CLI_ERROR',
      message: '--no-browser and --scope can only be used with --method oauth.',
    });

    const oauthWithApiKeyStdin = await runCli(
      ['login', '--method', 'oauth', '--api-key-stdin', '--json'],
      environment,
      'secret-that-must-not-leak\n',
    );
    expect(oauthWithApiKeyStdin.code).to.equal(1);
    expect(oauthWithApiKeyStdin.stdout).to.equal('');
    expect(oauthWithApiKeyStdin.stderr).not.to.include('secret-that-must-not-leak');
    expect(JSON.parse(oauthWithApiKeyStdin.stderr)).to.deep.include({
      code: 'CLI_ERROR',
      message: '--api-key-stdin cannot be used with --method oauth.',
    });
  });

  it('exposes login only as a top-level command', async () => {
    const environment = { HOME: testHome };
    const loginHelp = await runCli(['login', '--help'], environment);
    expect(loginHelp.code).to.equal(0);

    const removedAlias = await runCli(['auth', 'login', '--help'], environment);
    expect(removedAlias.code).to.equal(2);
    expect(removedAlias.stdout).to.equal('');
    expect(removedAlias.stderr).to.include('Command auth:login not found');
  });
});
