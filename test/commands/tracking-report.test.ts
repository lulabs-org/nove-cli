import { expect } from 'chai';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('tracking-report request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-tracking-report-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends the documented method, path, query, aliases, and payload', async () => {
    const reportContent = path.join(testHome, 'report.md');
    const reportMetadata = path.join(testHome, 'report-metadata.json');
    const reportSources = path.join(testHome, 'report-sources.json');
    writeFileSync(reportContent, '# Matrix report\n');
    writeFileSync(reportMetadata, JSON.stringify({ department: 'Engineering' }));
    writeFileSync(reportSources, JSON.stringify([
      { metadata: { page: 1 }, sourceId: 'meeting-1', sourceType: 'MEETING' },
    ]));
    const cases: SuccessCase[] = [
    {
      args: [
        'tracking-report', 'create', '--target-type', 'USER', '--target-id', 'user-1',
        '--target-name', 'Matrix User', '--target-metadata-file', reportMetadata,
        '--tracking-type', 'USER_PROFILE', '--cadence', 'MONTHLY',
        '--base-date', '2026-08-24T09:00:00+08:00', '--timezone', 'Asia/Shanghai',
        '--content-file', reportContent, '--generated-by', 'AI', '--ai-model', 'matrix-model',
        '--sources-file', reportSources,
      ],
      assertRequest: expectRequest('POST', '/tracking-reports', {
        aiModel: 'matrix-model',
        baseDate: '2026-08-24T09:00:00+08:00',
        cadence: 'MONTHLY',
        content: '# Matrix report\n',
        generatedBy: 'AI',
        sources: [{ metadata: { page: 1 }, sourceId: 'meeting-1', sourceType: 'MEETING' }],
        targetId: 'user-1',
        targetMetadata: { department: 'Engineering' },
        targetName: 'Matrix User',
        targetType: 'USER',
        timezone: 'Asia/Shanghai',
        trackingType: 'USER_PROFILE',
      }),
      name: 'tracking report create',
    },
    {
      args: ['tracking-report', 'get', 'report-1'],
      assertRequest: expectRequest('GET', '/tracking-reports/report-1'),
      name: 'tracking report get',
    },
    {
      args: [
        'tracking-report', 'list', '--target-type', 'PROJECT', '--target-id', 'project-1',
        '--keyword', 'Matrix', '--tracking-type', 'PROJECT_PROGRESS', '--cadence', 'WEEKLY',
        '--period-start', '2026-08-17T00:00:00+08:00',
        '--period-end', '2026-08-24T00:00:00+08:00', '--page', '2', '--limit', '100',
      ],
      assertRequest(request) {
        expectRequest('GET', '/tracking-reports')(request);
        expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
          cadence: 'WEEKLY',
          keyword: 'Matrix',
          limit: '100',
          page: '2',
          periodEnd: '2026-08-24T00:00:00+08:00',
          periodStart: '2026-08-17T00:00:00+08:00',
          targetId: 'project-1',
          targetType: 'PROJECT',
          trackingType: 'PROJECT_PROGRESS',
        });
      },
      name: 'tracking report list',
      response: { data: [], page: 2, total: 0, totalPages: 0 },
    },
    {
      args: [
        'tracking-report', 'update', 'report-1', '--content', 'Updated report',
        '--clear-generated-by', '--clear-ai-model', '--sources', '[]',
      ],
      assertRequest: expectRequest('PUT', '/tracking-reports/report-1', {
        aiModel: null,
        content: 'Updated report',
        generatedBy: null,
        sources: [],
      }),
      name: 'tracking report update',
    },
    {
      args: ['tracking-report', 'delete', 'report-1', '--yes'],
      assertRequest: expectRequest('DELETE', '/tracking-reports/report-1'),
      name: 'tracking report delete',
    },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
