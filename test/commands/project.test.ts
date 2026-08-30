import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome, runCli } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';
import { listen, readRequest } from '../helpers/http-server.js';

describe('project request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-project-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends every non-destructive project endpoint with documented flags', async () => {
    const cases: SuccessCase[] = [
      {
        args: [
          'project', 'create', '--title', 'Agent Project', '--code', 'PRJ-001',
          '--slug', 'Agent_Project', '--level', 'ADVANCED', '--status', 'ENROLLING',
          '--max-students', '20', '--enrolled-count', '5', '--tag', 'Agent',
          '--prerequisite', 'TypeScript', '--outcome', 'Working agent', '--owner-id', 'user-1',
          '--product-id', 'product-1', '--featured', '--metadata', '{"source":"cli"}',
          '--start-date', '2026-09-01T09:00:00+08:00', '--end-date', '2026-09-01T18:00:00+08:00',
        ],
        assertRequest: expectRequest('POST', '/admin/projects', {
          code: 'PRJ-001',
          endDate: '2026-09-01T18:00:00+08:00',
          enrolledCount: 5,
          isFeatured: true,
          level: 'ADVANCED',
          maxStudents: 20,
          metadata: { source: 'cli' },
          outcomes: ['Working agent'],
          ownerId: 'user-1',
          prerequisites: ['TypeScript'],
          productId: 'product-1',
          slug: 'agent-project',
          startDate: '2026-09-01T09:00:00+08:00',
          status: 'ENROLLING',
          tags: ['Agent'],
          title: 'Agent Project',
        }),
        name: 'project create',
      },
      {
        args: ['project', 'get', 'project-1'],
        assertRequest: expectRequest('GET', '/admin/projects/project-1'),
        name: 'project get',
      },
      {
        args: [
          'project', 'list', '--keyword', 'Agent', '--category', 'AI', '--status', 'ENROLLING',
          '--level', 'ADVANCED', '--featured', '--owner-id', 'user-1', '--product-id', 'product-1',
          '--page', '2', '--limit', '50', '--sort-by', 'enrolledCount', '--sort-order', 'desc',
        ],
        assertRequest(request) {
          expectRequest('GET', '/admin/projects')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
            category: 'AI',
            isFeatured: 'true',
            keyword: 'Agent',
            level: 'ADVANCED',
            ownerId: 'user-1',
            page: '2',
            pageSize: '50',
            productId: 'product-1',
            sortField: 'enrolledCount',
            sortOrder: 'desc',
            status: 'ENROLLING',
          });
        },
        name: 'project list',
        response: { items: [], page: 2, total: 0, totalPages: 0 },
      },
      {
        args: [
          'project', 'update', 'project-1', '--title', 'Updated Project', '--no-featured',
          '--clear', 'subtitle', '--clear', 'tags', '--clear', 'owner-id',
        ],
        assertRequest: expectRequest('PUT', '/admin/projects/project-1', {
          isFeatured: false,
          ownerId: null,
          subtitle: null,
          tags: [],
          title: 'Updated Project',
        }),
        name: 'project update',
      },
      {
        args: ['project', 'status', 'project-1', '--status', 'COMPLETED'],
        assertRequest: expectRequest('PATCH', '/admin/projects/project-1/status', { status: 'COMPLETED' }),
        name: 'project status',
      },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });

  it('reads the exact target before soft deletion', async () => {
    const requests: Array<{ method?: string; path?: string }> = [];
    const server = await listen(async (request, response) => {
      await readRequest(request);
      requests.push({ method: request.method, path: request.url });
      if (request.method === 'GET') {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ id: 'project-1', status: 'DRAFT', title: 'Agent Project' }));
        return;
      }

      response.statusCode = 204;
      response.end();
    });

    try {
      const result = await runCli(['project', 'delete', 'project-1', '--yes', '--json'], {
        HOME: testHome,
        NOVE_API_URL: server.url,
      });
      expect(result.code).to.equal(0);
      expect(result.stdout).to.equal('null\n');
      expect(requests).to.deep.equal([
        { method: 'GET', path: '/admin/projects/project-1' },
        { method: 'DELETE', path: '/admin/projects/project-1' },
      ]);
    } finally {
      await server.close();
    }
  });

  it('returns the fetched target during a deletion dry run', async () => {
    const server = await listen(async (_request, response) => {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ id: 'project-1', status: 'DRAFT', title: 'Agent Project' }));
    });
    try {
      const result = await runCli(['project', 'delete', 'project-1', '--dry-run', '--json'], {
        HOME: testHome,
        NOVE_API_URL: server.url,
      });
      expect(JSON.parse(result.stdout)).to.deep.include({ dryRun: true, resource: 'project' });
      expect(JSON.parse(result.stdout).target).to.include({ title: 'Agent Project' });
    } finally {
      await server.close();
    }
  });
});
