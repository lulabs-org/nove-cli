import { expect } from 'chai';

import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';

describe('command validation matrix', () => {
  let testHome: string;

  beforeEach(() => {
    testHome = createTestHome('nove-cli-command-validation-');
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('returns structured errors for missing arguments and required flags on every command family', async () => {
    const cases = [
      ['config', 'set', '--json'], ['meeting', 'create', '--json'], ['meeting', 'get', '--json'],
      ['meeting', 'participants', '--json'], ['meeting', 'update', '--json'], ['minute', 'get', '--json'],
      ['minute', 'transcript', '--json'], ['minute', 'speaker-summary', 'create', '--json'],
      ['minute', 'speaker-summary', 'get', '--json'], ['minute', 'speaker-summary', 'update', '--json'],
      ['tracking-report', 'create', '--json'], ['tracking-report', 'get', '--json'],
      ['tracking-report', 'update', '--json'],
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
    const usageCases = [
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'INVALID', '--type', 'ONE_TIME', '--json'],
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'OTHER', '--type', 'INVALID', '--json'],
      ['meeting', 'create', '--platform-meeting-id', 'id', '--title', 'x', '--platform', 'OTHER', '--type', 'ONE_TIME', '--duration-seconds', '-1', '--json'],
      ['meeting', 'list', '--status', 'INVALID', '--json'], ['meeting', 'list', '--page', '0', '--json'],
      ['meeting', 'list', '--limit', '101', '--json'], ['meeting', 'list', '--all', '--page', '2', '--json'],
      ['meeting', 'update', 'id', '--participant-count', '-1', '--json'],
      ['minute', 'list', '--source', 'INVALID', '--json'],
      ['minute', 'speaker-summary', 'create', 'id', '--platform-user-id', 'u', '--part-summary', 's', '--generated-by', 'INVALID', '--json'],
      ['minute', 'transcript', 'id', '--format', 'json', '--json'], ['user', 'create', '--gender', 'INVALID', '--json'],
      ['tracking-report', 'list', '--target-type', 'INVALID', '--json'],
      ['tracking-report', 'list', '--tracking-type', 'INVALID', '--json'],
      ['tracking-report', 'list', '--cadence', 'INVALID', '--json'],
      ['tracking-report', 'list', '--page', '0', '--json'], ['tracking-report', 'list', '--limit', '101', '--json'],
      ['user', 'list', '--sort-by', 'INVALID', '--json'], ['user', 'list', '--sort-order', 'INVALID', '--json'],
    ];
    const usageResults = await Promise.all(usageCases.map((args) =>
      runCli(args, { HOME: testHome, NOVE_API_URL: 'http://127.0.0.1:1' })
    ));
    for (const [index, result] of usageResults.entries()) {
      const args = usageCases[index];
      expect(result.code, args.join(' ')).to.equal(2);
      expect(JSON.parse(result.stderr), args.join(' ')).to.include({ code: 'CLI_USAGE_ERROR' });
    }

    const localCases = [
      ['meeting', 'stats', '--date', '2026-02-30', '--json'],
      ['meeting', 'list', '--fields', 'id', '--json'], ['meeting', 'list', '--sort', 'id:asc', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--start-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--start-date', '2026-08-25T00:00:00Z', '--end-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--timezone', 'Mars/Olympus', '--json'],
      ['tracking-report', 'list', '--period-start', '2026-08-25T00:00:00Z', '--period-end', '2026-08-24T00:00:00Z', '--json'],
      ['tracking-report', 'update', 'report-1', '--json'],
      ['tracking-report', 'update', 'report-1', '--ai-model', 'model', '--clear-ai-model', '--json'],
      ['tracking-report', 'update', 'report-1', '--sources', '{}', '--json'],
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
});
