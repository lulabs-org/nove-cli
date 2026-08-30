import { expect } from 'chai';

import { loginWithApiKey } from '../helpers/authentication.js';
import { createTestHome, removeTestHome } from '../helpers/cli.js';
import { expectRequest, runSuccessCase, type SuccessCase } from '../helpers/command-matrix.js';

describe('order request matrix', () => {
  let testHome: string;

  beforeEach(async () => {
    testHome = createTestHome('nove-cli-order-matrix-');
    await loginWithApiKey(testHome);
  });

  afterEach(() => {
    removeTestHome(testHome);
  });

  it('sends every order endpoint with documented flags and payloads', async () => {
    const cases: SuccessCase[] = [
      {
        args: [
          'order', 'create', '--amount', '29900', '--order-code', 'ORD001',
          '--product-id', 'product-1', '--purchaser-id', 'user-1', '--channel-id', '2',
          '--currency', 'CNY', '--status', 'PAID', '--payment-provider', 'WECHAT',
          '--paid-at', '2026-08-30T10:00:00+08:00', '--metadata', '{"source":"manual"}',
        ],
        assertRequest: expectRequest('POST', '/admin/orders', {
          amount: 29_900,
          channelId: 2,
          currency: 'CNY',
          metadata: { source: 'manual' },
          orderCode: 'ORD001',
          paidAt: '2026-08-30T10:00:00+08:00',
          paymentProvider: 'WECHAT',
          productId: 'product-1',
          purchaserId: 'user-1',
          status: 'PAID',
        }),
        name: 'order create',
      },
      {
        args: ['order', 'get', 'order-1'],
        assertRequest: expectRequest('GET', '/admin/orders/order-1'),
        name: 'order get',
      },
      {
        args: [
          'order', 'list', '--keyword', 'ORD', '--status', 'PAID', '--currency', 'CNY',
          '--payment-provider', 'WECHAT', '--channel-id', '2', '--product-id', 'product-1',
          '--purchaser-id', 'user-1', '--current-owner-id', 'user-2', '--include-deleted',
          '--paid-from', '2026-08-01T00:00:00+08:00', '--paid-to', '2026-09-01T00:00:00+08:00',
          '--created-from', '2026-07-01T00:00:00+08:00', '--created-to', '2026-09-01T00:00:00+08:00',
          '--page', '3', '--limit', '25', '--sort-by', 'amount', '--sort-order', 'asc',
        ],
        assertRequest(request) {
          expectRequest('GET', '/admin/orders')(request);
          expect(Object.fromEntries(request.url.searchParams)).to.deep.equal({
            channelId: '2',
            createdFrom: '2026-07-01T00:00:00+08:00',
            createdTo: '2026-09-01T00:00:00+08:00',
            currency: 'CNY',
            currentOwnerId: 'user-2',
            includeDeleted: 'true',
            keyword: 'ORD',
            page: '3',
            pageSize: '25',
            paidFrom: '2026-08-01T00:00:00+08:00',
            paidTo: '2026-09-01T00:00:00+08:00',
            paymentProvider: 'WECHAT',
            productId: 'product-1',
            purchaserId: 'user-1',
            sortField: 'amount',
            sortOrder: 'asc',
            status: 'PAID',
          });
        },
        name: 'order list',
        response: { items: [], page: 3, total: 0, totalPages: 0 },
      },
      {
        args: [
          'order', 'update', 'order-1', '--amount', '39900', '--email', 'buyer@example.test',
          '--clear', 'product-id', '--clear', 'metadata', '--clear', 'paid-at',
        ],
        assertRequest: expectRequest('PUT', '/admin/orders/order-1', {
          amount: 39_900,
          email: 'buyer@example.test',
          metadata: null,
          paidAt: null,
          productId: null,
        }),
        name: 'order update',
      },
      {
        args: ['order', 'status', 'order-1', '--status', 'REFUNDED'],
        assertRequest: expectRequest('PATCH', '/admin/orders/order-1/status', { status: 'REFUNDED' }),
        name: 'order status',
      },
      {
        args: ['order', 'delete', 'order-1', '--yes'],
        assertRequest: expectRequest('DELETE', '/admin/orders/order-1'),
        name: 'order delete',
        status: 204,
      },
    ];

    await Promise.all(cases.map((testCase) => runSuccessCase(testHome, testCase)));
  });
});
