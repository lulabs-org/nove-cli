import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('minute request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-minute-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends the documented method, path, query, aliases, and payload', async () => {
    const cases: SuccessCase[] = [
  {
    args: ['minute', 'get', 'minute-1'],
    assertRequest: expectRequest('GET', '/minutes/minute-1'),
    name: 'minute get',
  },
  {
    args: ['minute', 'list', '--meetingId', 'meeting-1', '--source', 'PLATFORM_AUTO', '--page', '2', '--limit', '100'],
    assertRequest(request) {
      expectRequest('GET', '/minutes')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        limit: '100',
        meetingId: 'meeting-1',
        page: '2',
        source: 'PLATFORM_AUTO',
      });
    },
    name: 'minute list',
    response: { data: [], page: 2, total: 0, totalPages: 0 },
  },
  {
    args: ['minute', 'transcript', 'minute-1'],
    assertRequest: expectRequest('GET', '/minutes/minute-1/transcript'),
    name: 'minute transcript',
  },
  {
    args: ['minute', 'transcript', 'minute-1', '--includeLocalUser'],
    assertRequest(request) {
      expectRequest('GET', '/minutes/minute-1/transcript')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        includeLocalUser: 'true',
      });
    },
    name: 'minute transcript with local user',
  },
  {
    args: [
      'minute', 'meeting-transcripts', 'platform-user-1',
      '--startDate', '2026-08-01T00:00:00+08:00',
      '--endDate', '2026-09-01T00:00:00+08:00',
    ],
    assertRequest(request) {
      expectRequest('GET', '/platform-users/platform-user-1/meeting-transcripts')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        endDate: '2026-09-01T00:00:00+08:00',
        startDate: '2026-08-01T00:00:00+08:00',
      });
    },
    name: 'platform user meeting transcripts',
  },
  {
    args: ['minute', 'transcript-context', 'minute-1', 'platform-user-1', '--depth', '3'],
    assertRequest(request) {
      expectRequest(
        'GET',
        '/minutes/minute-1/platform-users/platform-user-1/transcript-context',
      )(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ depth: '3' });
    },
    name: 'platform user transcript context',
  },
  {
    args: ['minute', 'delete', 'minute-1', '--yes'],
    assertRequest: expectRequest('DELETE', '/minutes/minute-1'),
    name: 'minute delete',
    status: 204,
  },
  {
    args: [
      'minute', 'speaker-summary', 'create', 'minute-1', '--platformUserId', 'platform-user-1',
      '--partSummary', 'Summary', '--keywords', 'alpha', '--keywords', 'beta',
      '--generatedBy', 'HYBRID', '--aiModel', 'matrix-model',
    ],
    assertRequest: expectRequest('POST', '/minutes/minute-1/speaker-summaries', {
      aiModel: 'matrix-model',
      generatedBy: 'HYBRID',
      keywords: ['alpha', 'beta'],
      partSummary: 'Summary',
      platformUserId: 'platform-user-1',
    }),
    name: 'speaker summary create',
  },
  {
    args: ['minute', 'speaker-summary', 'get', 'minute-1', 'summary-1'],
    assertRequest: expectRequest('GET', '/minutes/minute-1/speaker-summaries/summary-1'),
    name: 'speaker summary get',
  },
  {
    args: ['minute', 'speaker-summary', 'list', 'minute-1', '--page', '2', '--limit', '100'],
    assertRequest(request) {
      expectRequest('GET', '/minutes/minute-1/speaker-summaries')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({ limit: '100', page: '2' });
    },
    name: 'speaker summary list',
    response: { data: [], page: 2, total: 0, totalPages: 0 },
  },
  {
    args: [
      'minute', 'speaker-summary', 'update', 'minute-1', 'summary-1',
      '--partSummary', 'Updated', '--keywords', 'gamma',
    ],
    assertRequest: expectRequest('PUT', '/minutes/minute-1/speaker-summaries/summary-1', {
      keywords: ['gamma'],
      partSummary: 'Updated',
    }),
    name: 'speaker summary update',
  },
  {
    args: ['minute', 'speaker-summary', 'delete', 'minute-1', 'summary-1', '--yes'],
    assertRequest: expectRequest('DELETE', '/minutes/minute-1/speaker-summaries/summary-1'),
    name: 'speaker summary delete',
    status: 204,
  },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
