import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { CURRENCIES, ORDER_STATUSES, PAYMENT_PROVIDERS, validateDateRange } from '../../utils/validation.js';

export default class OrderList extends NoveCommand {
  static description = 'List orders';
  static flags = {
    all: allFlag,
    'channel-id': Flags.integer({ description: 'Filter by channel ID', min: 1 }),
    'created-from': Flags.string({ description: 'Created from ISO 8601 date-time with timezone' }),
    'created-to': Flags.string({ description: 'Created to ISO 8601 date-time with timezone' }),
    currency: Flags.string({ description: 'Filter by currency', options: [...CURRENCIES] }),
    'current-owner-id': Flags.string({ description: 'Filter by current owner user ID' }),
    fields: fieldsFlag,
    'include-deleted': Flags.boolean({ description: 'Include soft-deleted orders' }),
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search order numbers, product, customer, or transaction' }),
    limit: Flags.integer({ default: 10, description: 'Items per page', min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    'paid-from': Flags.string({ description: 'Paid from ISO 8601 date-time with timezone' }),
    'paid-to': Flags.string({ description: 'Paid to ISO 8601 date-time with timezone' }),
    'payment-provider': Flags.string({ description: 'Filter by payment provider', options: [...PAYMENT_PROVIDERS] }),
    'product-id': Flags.string({ description: 'Filter by product ID' }),
    'purchaser-id': Flags.string({ description: 'Filter by purchaser user ID' }),
    sort: sortFlag,
    'sort-by': Flags.string({
      default: 'createdAt',
      description: 'Server sort field',
      options: ['createdAt', 'updatedAt', 'paidAt', 'amount', 'status', 'orderCode', 'orderNumber', 'financialClosedAt'],
    }),
    'sort-order': Flags.string({ default: 'desc', description: 'Server sort order', options: ['asc', 'desc'] }),
    status: Flags.string({ description: 'Filter by order status', options: [...ORDER_STATUSES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(OrderList);
    try {
      validateListFlags(flags);
      validateDateRange(flags['paid-from'], flags['paid-to']);
      validateDateRange(flags['created-from'], flags['created-to']);

      const fetchPage = async (page: number): Promise<Record<string, unknown>> => {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('pageSize', String(flags.limit));
        const mappings: Array<[string, boolean | number | string | undefined]> = [
          ['keyword', flags.keyword], ['status', flags.status], ['currency', flags.currency],
          ['paymentProvider', flags['payment-provider']], ['channelId', flags['channel-id']],
          ['productId', flags['product-id']], ['purchaserId', flags['purchaser-id']],
          ['currentOwnerId', flags['current-owner-id']], ['paidFrom', flags['paid-from']],
          ['paidTo', flags['paid-to']], ['createdFrom', flags['created-from']],
          ['createdTo', flags['created-to']], ['includeDeleted', flags['include-deleted']],
        ];
        for (const [name, value] of mappings) {
          if (value !== undefined) query.set(name, String(value));
        }

        query.set('sortField', flags['sort-by']);
        query.set('sortOrder', flags['sort-order']);
        return fetchApi(`/admin/orders?${query}`, {}, this.config.configDir) as Promise<Record<string, unknown>>;
      };

      const response = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, response, {
        defaultFields: ['id', 'orderCode', 'orderNumber', 'productName', 'amount', 'currency', 'status', 'createdAt'],
        fields: flags.fields,
        json: flags.json,
        noun: 'orders',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
