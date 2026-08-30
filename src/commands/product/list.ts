import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { CURRENCIES, PRODUCT_CATEGORIES, PRODUCT_STATUSES, SORT_ORDERS } from '../../utils/validation.js';

export default class ProductList extends NoveCommand {
  static description = 'List products';
  static flags = {
    all: allFlag,
    category: Flags.string({ description: 'Filter by product category', options: [...PRODUCT_CATEGORIES] }),
    currency: Flags.string({ description: 'Filter by currency', options: [...CURRENCIES] }),
    featured: Flags.boolean({ allowNo: true, description: 'Filter by featured status' }),
    fields: fieldsFlag,
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search product code, name, or description' }),
    limit: Flags.integer({ default: 10, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    recommended: Flags.boolean({ allowNo: true, description: 'Filter by recommended status' }),
    sort: sortFlag,
    'sort-by': Flags.string({
      default: 'sortOrder',
      description: 'Server sort field',
      options: ['createdAt', 'updatedAt', 'name', 'price', 'sortOrder', 'salesCount'],
    }),
    'sort-order': Flags.string({ default: 'asc', description: 'Server sort order', options: [...SORT_ORDERS] }),
    status: Flags.string({ description: 'Filter by product status', options: [...PRODUCT_STATUSES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProductList);
    try {
      validateListFlags(flags);
      const fetchPage = async (page: number): Promise<Record<string, unknown>> => {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('pageSize', String(flags.limit));
        if (flags.keyword) query.set('keyword', flags.keyword);
        if (flags.category) query.set('category', flags.category);
        if (flags.status) query.set('status', flags.status);
        if (flags.currency) query.set('currency', flags.currency);
        if (flags.recommended !== undefined) query.set('isRecommended', String(flags.recommended));
        if (flags.featured !== undefined) query.set('isFeatured', String(flags.featured));
        query.set('sortField', flags['sort-by']);
        query.set('sortOrder', flags['sort-order']);
        return fetchApi(`/admin/products?${query}`, {}, this.config.configDir) as Promise<Record<string, unknown>>;
      };

      const response = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, response, {
        defaultFields: ['id', 'productCode', 'name', 'category', 'status', 'price', 'currency'],
        fields: flags.fields,
        json: flags.json,
        noun: 'products',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
