import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { PROJECT_LEVELS, PROJECT_STATUSES, SORT_ORDERS } from '../../utils/validation.js';

export default class ProjectList extends NoveCommand {
  static description = 'List projects in the current organization';
  static flags = {
    all: allFlag,
    category: Flags.string({ description: 'Filter by project category' }),
    featured: Flags.boolean({ allowNo: true, description: 'Filter by featured status' }),
    fields: fieldsFlag,
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search title, subtitle, code, slug, or description' }),
    level: Flags.string({ description: 'Filter by project level', options: [...PROJECT_LEVELS] }),
    limit: Flags.integer({ default: 10, description: 'Items per page', max: 100, min: 1 }),
    'owner-id': Flags.string({ description: 'Filter by owner local user ID' }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    'product-id': Flags.string({ description: 'Filter by related product ID' }),
    sort: sortFlag,
    'sort-by': Flags.string({
      default: 'sortOrder',
      description: 'Server sort field',
      options: ['createdAt', 'updatedAt', 'title', 'sortOrder', 'startDate', 'publishedAt', 'enrolledCount'],
    }),
    'sort-order': Flags.string({ default: 'asc', description: 'Server sort order', options: [...SORT_ORDERS] }),
    status: Flags.string({ description: 'Filter by project status', options: [...PROJECT_STATUSES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProjectList);
    try {
      validateListFlags(flags);
      const fetchPage = async (page: number): Promise<Record<string, unknown>> => {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('pageSize', String(flags.limit));
        if (flags.keyword) query.set('keyword', flags.keyword);
        if (flags.category) query.set('category', flags.category);
        if (flags.status) query.set('status', flags.status);
        if (flags.level) query.set('level', flags.level);
        if (flags.featured !== undefined) query.set('isFeatured', String(flags.featured));
        if (flags['owner-id']) query.set('ownerId', flags['owner-id']);
        if (flags['product-id']) query.set('productId', flags['product-id']);
        query.set('sortField', flags['sort-by']);
        query.set('sortOrder', flags['sort-order']);
        return fetchApi(`/admin/projects?${query}`, {}, this.config.configDir) as Promise<Record<string, unknown>>;
      };

      const response = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, response, {
        defaultFields: ['id', 'code', 'title', 'category', 'level', 'status', 'enrolledCount'],
        fields: flags.fields,
        json: flags.json,
        noun: 'projects',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
