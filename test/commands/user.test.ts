import { expect } from 'chai';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('user request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-user-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends the documented method, path, query, aliases, and payload', async () => {
    const csv = path.join(testHome, 'matrix-users.csv');
    writeFileSync(csv, 'username,email\nmatrix,matrix@example.test\n');
    const cases: SuccessCase[] = [
    {
      args: [
        'user', 'create', '--username', 'matrix_user', '--email', 'matrix@example.test',
        '--phone', '13800138000', '--countryCode', '+86', '--displayName', 'Matrix User',
        '--fullName', 'Matrix User', '--active', '--gender', 'OTHER',
        '--dateOfBirth', '2000-02-29', '--avatar', 'https://example.test/avatar.png',
        '--bio', 'bio', '--address', 'address', '--city', 'city', '--country', 'country',
        '--website', 'https://example.test', '--zipCode', '200000',
      ],
      assertRequest: expectRequest('POST', '/admin/users', {
        active: true,
        address: 'address',
        avatar: 'https://example.test/avatar.png',
        bio: 'bio',
        city: 'city',
        country: 'country',
        countryCode: '+86',
        dateOfBirth: '2000-02-29',
        displayName: 'Matrix User',
        email: 'matrix@example.test',
        fullName: 'Matrix User',
        gender: 'OTHER',
        phone: '13800138000',
        username: 'matrix_user',
        website: 'https://example.test',
        zipCode: '200000',
      }),
      name: 'user create',
    },
    {
      args: ['user', 'get', 'user-1'],
      assertRequest: expectRequest('GET', '/admin/users/user-1'),
      name: 'user get',
    },
    {
      args: [
        'user', 'list', '--keyword', 'matrix', '--no-active', '--page', '2', '--limit', '100',
        '--sortBy', 'email', '--sortOrder', 'asc',
      ],
      assertRequest(request) {
        expectRequest('GET', '/admin/users')(request);
        expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
          active: 'false',
          keyword: 'matrix',
          page: '2',
          pageSize: '100',
          sortBy: 'email',
          sortOrder: 'asc',
        });
      },
      name: 'user list',
      response: { items: [], page: 2, total: 0, totalPages: 0 },
    },
    {
      args: [
        'user', 'update', 'user-1', '--display-name', 'Updated', '--no-active',
        '--website', 'https://example.test/new',
      ],
      assertRequest: expectRequest('PATCH', '/admin/users/user-1', {
        active: false,
        displayName: 'Updated',
        website: 'https://example.test/new',
      }),
      name: 'user update',
    },
    {
      args: ['user', 'delete', 'user-1', '--yes'],
      assertRequest: expectRequest('DELETE', '/admin/users/user-1'),
      name: 'user delete',
      status: 204,
    },
    {
      args: ['user', 'import', '--file', csv],
      assertRequest(request) {
        expectRequest('POST', '/admin/users/import')(request);
        expect(request.headers['content-type']).to.match(/^multipart\/form-data; boundary=/);
        expect(request.body).to.include('matrix-users.csv');
      },
      name: 'user import',
      response: { failureCount: 0, successCount: 1, total: 1 },
    },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
