import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('product request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-product-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends every product endpoint with documented flags and payloads', async () => {
    const cases: SuccessCase[] = [
      {
        args: [
          'product', 'create', '--product-code', 'COURSE_001', '--name', 'Python',
          '--category', 'COURSE', '--status', 'ACTIVE', '--price', '29900', '--currency', 'CNY',
          '--tag', 'Python', '--tag', 'beginner', '--recommended', '--no-featured',
          '--rating', '4.75', '--published-at', '2026-08-30T10:00:00+08:00',
        ],
        assertRequest: expectRequest('POST', '/admin/products', {
          category: 'COURSE',
          currency: 'CNY',
          isFeatured: false,
          isRecommended: true,
          name: 'Python',
          price: 29_900,
          productCode: 'COURSE_001',
          publishedAt: '2026-08-30T10:00:00+08:00',
          rating: 4.75,
          status: 'ACTIVE',
          tags: ['Python', 'beginner'],
        }),
        name: 'product create',
      },
      {
        args: ['product', 'get', 'product-1'],
        assertRequest: expectRequest('GET', '/admin/products/product-1'),
        name: 'product get',
      },
      {
        args: [
          'product', 'list', '--keyword', 'Python', '--category', 'COURSE', '--status', 'ACTIVE',
          '--currency', 'CNY', '--recommended', '--no-featured', '--page', '2', '--limit', '50',
          '--sort-by', 'salesCount', '--sort-order', 'desc',
        ],
        assertRequest(request) {
          expectRequest('GET', '/admin/products')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
            category: 'COURSE',
            currency: 'CNY',
            isFeatured: 'false',
            isRecommended: 'true',
            keyword: 'Python',
            page: '2',
            pageSize: '50',
            sortField: 'salesCount',
            sortOrder: 'desc',
            status: 'ACTIVE',
          });
        },
        name: 'product list',
        response: { items: [], page: 2, total: 0, totalPages: 0 },
      },
      {
        args: [
          'product', 'update', 'product-1', '--name', 'Advanced Python', '--no-recommended',
          '--clear', 'description', '--clear', 'tags', '--clear', 'published-at',
        ],
        assertRequest: expectRequest('PUT', '/admin/products/product-1', {
          description: null,
          isRecommended: false,
          name: 'Advanced Python',
          publishedAt: null,
          tags: [],
        }),
        name: 'product update',
      },
      {
        args: ['product', 'status', 'product-1', '--status', 'ARCHIVED'],
        assertRequest: expectRequest('PATCH', '/admin/products/product-1/status', { status: 'ARCHIVED' }),
        name: 'product status',
      },
      {
        args: ['product', 'delete', 'product-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/admin/products/product-1'),
        name: 'product delete',
        status: 204,
      },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
