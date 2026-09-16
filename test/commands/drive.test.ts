import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('drive request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-drive-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends every drive endpoint with documented flags and payloads', async () => {
    const cases: SuccessCase[] = [
      {
        args: ['drive', 'spaces'],
        assertRequest: expectRequest('GET', '/drive/spaces'),
        name: 'drive spaces',
        response: [{ id: 'space-1', name: 'Personal', orgId: null, type: 'PERSONAL' }],
      },
      {
        args: ['drive', 'space', 'list'],
        assertRequest: expectRequest('GET', '/drive/spaces'),
        name: 'drive space list',
        response: [{ id: 'space-1', name: 'Personal', orgId: null, type: 'PERSONAL' }],
      },
      {
        args: ['drive', 'list', '--space-id', 'space-1', '--parent-id', 'folder-1', '--limit', '20'],
        assertRequest(request) {
          expectRequest('GET', '/drive/spaces/space-1/nodes')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
            limit: '20',
            parentId: 'folder-1',
          });
        },
        name: 'drive list with parent and limit',
        response: { items: [], nextCursor: null },
      },
      {
        args: ['drive', 'folder', 'create', '--space-id', 'space-1', '--name', 'Projects', '--parent-id', 'folder-1'],
        assertRequest: expectRequest('POST', '/drive/folders', {
          name: 'Projects',
          parentId: 'folder-1',
          spaceId: 'space-1',
        }),
        name: 'drive folder create',
      },
      {
        args: ['drive', 'node', 'update', 'node-1', '--name', 'Renamed', '--no-inherit-acl'],
        assertRequest: expectRequest('PATCH', '/drive/nodes/node-1', {
          inheritAcl: false,
          name: 'Renamed',
        }),
        name: 'drive node update',
      },
      {
        args: ['drive', 'node', 'move', 'node-1', '--parent-id', 'folder-2'],
        assertRequest: expectRequest('POST', '/drive/nodes/node-1/move', {
          parentId: 'folder-2',
        }),
        name: 'drive node move to parent',
      },
      {
        args: ['drive', 'node', 'move', 'node-1', '--root'],
        assertRequest: expectRequest('POST', '/drive/nodes/node-1/move', {
          parentId: null,
        }),
        name: 'drive node move to root',
      },
      {
        args: ['drive', 'node', 'delete', 'node-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/drive/nodes/node-1'),
        name: 'drive node delete',
        status: 204,
      },
      {
        args: ['drive', 'node', 'restore', 'node-1'],
        assertRequest: expectRequest('POST', '/drive/nodes/node-1/restore'),
        name: 'drive node restore',
        status: 204,
      },
      {
        args: ['drive', 'node', 'audit', 'node-1'],
        assertRequest: expectRequest('GET', '/drive/nodes/node-1/audit'),
        name: 'drive node audit',
        response: [{ action: 'CREATE_FILE', actorId: 'user-1', createdAt: '2026-09-01T00:00:00Z', id: 'log-1' }],
      },
      {
        args: ['drive', 'file', 'get', 'file-1'],
        assertRequest: expectRequest('GET', '/drive/files/file-1'),
        name: 'drive file get',
      },
      {
        args: ['drive', 'file', 'preview-url', 'file-1'],
        assertRequest: expectRequest('POST', '/drive/files/file-1/preview-url'),
        name: 'drive file preview-url',
        response: { contentDisposition: 'inline', expiresInSeconds: 600, url: 'https://oss.example.com/preview' },
      },
      {
        args: ['drive', 'file', 'download-url', 'file-1'],
        assertRequest: expectRequest('POST', '/drive/files/file-1/download-url'),
        name: 'drive file download-url',
        response: { contentDisposition: 'attachment', expiresInSeconds: 600, url: 'https://oss.example.com/download' },
      },
      {
        args: ['drive', 'file', 'bindings', 'file-1'],
        assertRequest: expectRequest('GET', '/drive/files/file-1/bindings'),
        name: 'drive file bindings',
        response: [{ active: true, id: 'b-1', purpose: 'test', targetId: 't-1', targetType: 'MINUTE' }],
      },
      {
        args: ['drive', 'trash', 'list', '--space-id', 'space-1'],
        assertRequest(request) {
          expectRequest('GET', '/drive/trash')(request);
          expect(request.url.searchParams.get('spaceId')).to.equal('space-1');
        },
        name: 'drive trash list',
        response: { items: [] },
      },
      {
        args: ['drive', 'trash', 'purge', 'node-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/drive/trash/node-1/purge'),
        name: 'drive trash purge',
        status: 200,
      },
      {
        args: ['drive', 'trash', 'restore', 'node-1'],
        assertRequest: expectRequest('POST', '/drive/nodes/node-1/restore'),
        name: 'drive trash restore',
        status: 204,
      },
      {
        args: ['drive', 'grant', 'list', '--space-id', 'space-1'],
        assertRequest: expectRequest('GET', '/drive/spaces/space-1/grants'),
        name: 'drive grant list space',
        response: [],
      },
      {
        args: ['drive', 'grant', 'list', '--node-id', 'node-1'],
        assertRequest: expectRequest('GET', '/drive/nodes/node-1/grants'),
        name: 'drive grant list node',
        response: [],
      },
      {
        args: [
          'drive', 'grant', 'set', '--space-id', 'space-1', '--principal-type', 'USER',
          '--principal-id', 'user-1', '--effect', 'ALLOW', '--action', 'VIEW', '--action', 'DOWNLOAD',
        ],
        assertRequest: expectRequest('PUT', '/drive/spaces/space-1/grants', {
          actions: ['VIEW', 'DOWNLOAD'],
          effect: 'ALLOW',
          principalId: 'user-1',
          principalType: 'USER',
        }),
        name: 'drive grant set space',
      },
      {
        args: [
          'drive', 'grant', 'set', '--node-id', 'node-1', '--principal-type', 'ROLE',
          '--principal-id', 'role-1', '--effect', 'DENY', '--action', 'DELETE',
        ],
        assertRequest: expectRequest('PUT', '/drive/nodes/node-1/grants', {
          actions: ['DELETE'],
          effect: 'DENY',
          principalId: 'role-1',
          principalType: 'ROLE',
        }),
        name: 'drive grant set node',
      },
      {
        args: ['drive', 'grant', 'remove', 'grant-1', '--space-id', 'space-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/drive/spaces/space-1/grants/grant-1'),
        name: 'drive grant remove space',
        status: 204,
      },
      {
        args: ['drive', 'grant', 'remove', 'grant-2', '--node-id', 'node-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/drive/nodes/node-1/grants/grant-2'),
        name: 'drive grant remove node',
        status: 204,
      },
      {
        args: ['drive', 'upload-session', 'abort', 'session-1'],
        assertRequest: expectRequest('DELETE', '/drive/upload-sessions/session-1'),
        name: 'drive upload-session abort',
        status: 204,
      },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });

  it('supports dry run for destructive drive commands', async () => {
    const dryRunCases = [
      { args: ['drive', 'node', 'delete', 'node-1', '--dry-run'], resource: 'drive-node' },
      { args: ['drive', 'trash', 'purge', 'node-1', '--dry-run'], resource: 'drive-trash-node' },
      { args: ['drive', 'grant', 'remove', 'grant-1', '--space-id', 'space-1', '--dry-run'], resource: 'drive-grant' },
    ];

    await Promise.all(
      dryRunCases.map(async (testCase) => {
        const result = await runCli([...testCase.args, '--json'], { HOME: testHome });
        expect(result.code).to.equal(0);
        expect(result.stderr).to.equal('');
        const payload = JSON.parse(result.stdout);
        expect(payload).to.include({ dryRun: true, resource: testCase.resource });
      })
    );
  });

  it('rejects update when no fields are supplied', async () => {
    const result = await runCli(['drive', 'node', 'update', 'node-1', '--json'], { HOME: testHome });
    expect(result.code).to.equal(1);
    expect(JSON.parse(result.stderr)).to.deep.equal({
      code: 'CLI_ERROR',
      message: 'No fields provided to update.',
    });
  });
});
