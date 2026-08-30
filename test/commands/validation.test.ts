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
      ['minute', 'user-transcripts', '--json'], ['minute', 'transcript', '--json'],
      ['minute', 'transcript-context', '--json'], ['minute', 'speaker-summary', 'create', '--json'],
      ['minute', 'speaker-summary', 'get', '--json'], ['minute', 'speaker-summary', 'update', '--json'],
      ['order', 'create', '--json'], ['order', 'get', '--json'], ['order', 'status', '--json'],
      ['order', 'update', '--json'], ['product', 'create', '--json'], ['product', 'get', '--json'],
      ['product', 'status', '--json'], ['product', 'update', '--json'],
      ['project', 'create', '--json'], ['project', 'get', '--json'],
      ['project', 'status', '--json'], ['project', 'update', '--json'],
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
      [
        'minute', 'transcript-context', 'minute-1', 'platform-user-1',
        '--depth', '21', '--json',
      ],
      ['minute', 'speaker-summary', 'create', 'id', '--platform-user-id', 'u', '--part-summary', 's', '--generated-by', 'INVALID', '--json'],
      ['minute', 'transcript', 'id', '--format', 'json', '--json'], ['user', 'create', '--gender', 'INVALID', '--json'],
      ['tracking-report', 'list', '--target-type', 'INVALID', '--json'],
      ['tracking-report', 'list', '--tracking-type', 'INVALID', '--json'],
      ['tracking-report', 'list', '--cadence', 'INVALID', '--json'],
      ['order', 'list', '--status', 'INVALID', '--json'],
      ['product', 'list', '--category', 'INVALID', '--json'],
      ['project', 'list', '--level', 'INVALID', '--json'],
      ['project', 'create', '--title', 'P', '--enrolled-count', '3', '--json'],
      ['project', 'create', '--title', 'P', '--code', 'PRJ-001', '--json'],
      ['project', 'list', '--sort-by', 'enrolledCount', '--json'],
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
      [
        'minute', 'user-transcripts', 'platform-user-1',
        '--start-date', '2026-08-02T00:00:00Z',
        '--end-date', '2026-08-01T00:00:00Z', '--json',
      ],
      [
        'minute', 'user-transcripts', 'platform-user-1',
        '--start-date', '2026-08-01T00:00:00Z',
        '--end-date', '2026-09-02T00:00:00Z', '--json',
      ],
      ['meeting', 'list', '--fields', 'id', '--json'], ['meeting', 'list', '--sort', 'id:asc', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--start-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--start-date', '2026-08-25T00:00:00Z', '--end-date', '2026-08-24T00:00:00Z', '--json'],
      ['meeting', 'stats', '--date', '2026-08-24', '--timezone', 'Mars/Olympus', '--json'],
      ['tracking-report', 'list', '--period-start', '2026-08-25T00:00:00Z', '--period-end', '2026-08-24T00:00:00Z', '--json'],
      ['tracking-report', 'update', 'report-1', '--json'],
      ['tracking-report', 'update', 'report-1', '--ai-model', 'model', '--clear-ai-model', '--json'],
      ['tracking-report', 'update', 'report-1', '--sources', '{}', '--json'],
      ['order', 'update', 'order-1', '--json'],
      ['order', 'create', '--amount', '1', '--metadata', '[]', '--json'],
      ['product', 'update', 'product-1', '--json'],
      ['project', 'update', 'project-1', '--json'],
      ['project', 'create', '--title', 'P', '--metadata', '[]', '--json'],
      ['project', 'update', 'project-1', '--tag', 'x', '--clear', 'tags', '--json'],
      ['product', 'create', '--product-code', 'P', '--name', 'P', '--category', 'OTHER', '--rating', '6', '--json'],
      ['product', 'update', 'product-1', '--tag', 'x', '--clear', 'tags', '--json'],
      ['order', 'list', '--paid-from', '2026-09-01T00:00:00Z', '--paid-to', '2026-08-01T00:00:00Z', '--json'],
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
