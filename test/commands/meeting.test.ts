import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('meeting request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-meeting-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends the documented method, path, query, aliases, and payload', async () => {
    const cases: SuccessCase[] = [
  {
    args: [
      'meeting', 'create', '--platformMeetingId', 'platform-1', '--title', 'Matrix meeting',
      '--platform', 'OTHER', '--type', 'ONE_TIME', '--startTime', '2026-08-24T09:00:00+08:00',
      '--endTime', '2026-08-24T10:00:00+08:00', '--duration-seconds', '3600',
      '--meeting-code', 'code-1',
    ],
    assertRequest: expectRequest('POST', '/meetings', {
      actualStartAt: '2026-08-24T09:00:00+08:00',
      durationSeconds: 3600,
      endedAt: '2026-08-24T10:00:00+08:00',
      meetingCode: 'code-1',
      platform: 'OTHER',
      platformMeetingId: 'platform-1',
      title: 'Matrix meeting',
      type: 'ONE_TIME',
    }),
    name: 'meeting create',
  },
  {
    args: ['meeting', 'get', 'meeting-1'],
    assertRequest: expectRequest('GET', '/meetings/meeting-1'),
    name: 'meeting get',
  },
  {
    args: [
      'meeting', 'list', '--page', '2', '--limit', '100', '--platform', 'FEISHU',
      '--status', 'COMPLETED', '--type', 'SCHEDULED', '--search', 'matrix',
      '--startDate', '2026-08-24T00:00:00+08:00', '--endDate', '2026-08-25T00:00:00+08:00',
    ],
    assertRequest(request) {
      expectRequest('GET', '/meetings')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        endDate: '2026-08-25T00:00:00+08:00',
        limit: '100',
        page: '2',
        platform: 'FEISHU',
        search: 'matrix',
        startDate: '2026-08-24T00:00:00+08:00',
        status: 'COMPLETED',
        type: 'SCHEDULED',
      });
    },
    name: 'meeting list',
    response: { data: [], page: 2, total: 0, totalPages: 0 },
  },
  {
    args: ['meeting', 'participants', 'meeting-1', '--keyword', 'Alice', '--page', '2', '--limit', '100'],
    assertRequest(request) {
      expectRequest('GET', '/meetings/meeting-1/participants')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        limit: '100',
        page: '2',
        search: 'Alice',
      });
    },
    name: 'meeting participants',
    response: { data: [], page: 2, total: 0, totalPages: 0 },
  },
  {
    args: ['meeting', 'stats', '--date', '2026-08-24', '--timezone', 'Asia/Shanghai'],
    assertRequest(request) {
      expectRequest('GET', '/meetings/stats/summary')(request);
      expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
        endDate: '2026-08-24T16:00:00.000Z',
        startDate: '2026-08-23T16:00:00.000Z',
      });
    },
    name: 'meeting stats',
  },
  {
    args: [
      'meeting', 'update', 'meeting-1', '--actual-start-at', '2026-08-24T09:00:00+08:00',
      '--ended-at', '2026-08-24T10:00:00+08:00', '--duration-seconds', '3600',
      '--meeting-code', 'updated', '--participant-count', '4', '--title', 'Updated',
      '--type', 'RECURRING',
    ],
    assertRequest: expectRequest('PATCH', '/meetings/meeting-1', {
      actualStartAt: '2026-08-24T09:00:00+08:00',
      durationSeconds: 3600,
      endedAt: '2026-08-24T10:00:00+08:00',
      meetingCode: 'updated',
      participantCount: 4,
      title: 'Updated',
      type: 'RECURRING',
    }),
    name: 'meeting update',
  },
  {
    args: ['meeting', 'delete', 'meeting-1', '--yes'],
    assertRequest: expectRequest('DELETE', '/meetings/meeting-1'),
    name: 'meeting delete',
    status: 204,
  },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
