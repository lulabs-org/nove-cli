import { expect } from 'chai';

import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';

describe('command help matrix', () => {
  let testHome: string;

  beforeEach(() => {
    testHome = createTestHome('nove-cli-help-');
  });

  afterEach(() => {
    removeTestHome(testHome);
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
      ['tracking-report', 'create'], ['tracking-report', 'delete'], ['tracking-report', 'get'],
      ['tracking-report', 'list'], ['tracking-report', 'update'],
      ['user', 'create'], ['user', 'delete'], ['user', 'get'], ['user', 'import'],
      ['user', 'list'], ['user', 'update'],
    ];
    const results = await Promise.all(
      commands.map((command) => runCli([...command, '--help'], { HOME: testHome })),
    );

    for (const [index, result] of results.entries()) {
      expect(result.code, commands[index].join(' ')).to.equal(0);
      expect(result.stderr, commands[index].join(' ')).to.equal('');
      expect(result.stdout, commands[index].join(' ')).not.to.match(/--[a-z]+[A-Z][a-zA-Z-]*/);
    }

    expect(results[3].stdout).not.to.include('Delete a meeting minute');
  });

  it('loads root, topic, and explicit help entry points', async () => {
    const cases = [
      [], ['help'], ['meeting', '--help'], ['minute', '--help'],
      ['tracking-report', '--help'], ['user', '--help'],
    ];
    const results = await Promise.all(cases.map((args) => runCli(args, { HOME: testHome })));

    for (const [index, result] of results.entries()) {
      expect(result.code, cases[index].join(' ') || 'root').to.equal(0);
      expect(result.stderr, cases[index].join(' ') || 'root').to.equal('');
      expect(result.stdout, cases[index].join(' ') || 'root').not.to.equal('');
    }
  });

  it('exposes logout only as a top-level command', async () => {
    const topLevel = await runCli(['logout', '--help'], { HOME: testHome });
    const legacyAlias = await runCli(['auth', 'logout', '--help'], { HOME: testHome });

    expect(topLevel.code).to.equal(0);
    expect(topLevel.stdout).to.include('nove logout');
    expect(legacyAlias.code).not.to.equal(0);
    expect(`${legacyAlias.stdout}\n${legacyAlias.stderr}`).to.include('auth:logout');
  });
});
