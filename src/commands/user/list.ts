import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag } from '../../utils/list-output.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { SORT_ORDERS, USER_SORT_FIELDS } from '../../utils/validation.js';

export default class UserList extends Command {
  static description = 'List users';
  static flags = {
    active: Flags.boolean({ allowNo: true, description: 'Filter by active status' }),
    all: allFlag,
    fields: fieldsFlag,
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search username, email, phone, or display name' }),
    limit: Flags.integer({ default: 20, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    sort: sortFlag,
    'sort-by': Flags.string({ aliases: ['sortBy'], default: 'createdAt', description: 'Server sort field', options: [...USER_SORT_FIELDS] }),
    'sort-order': Flags.string({ aliases: ['sortOrder'], default: 'desc', description: 'Server sort order', options: [...SORT_ORDERS] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserList);
    try {
      const fetchPage = (page: number) => {
        const query = new URLSearchParams({
          page: String(page), pageSize: String(flags.limit),
          sortBy: flags['sort-by'], sortOrder: flags['sort-order'],
        });
        if (flags.keyword) query.set('keyword', flags.keyword);
        if (flags.active !== undefined) query.set('active', String(flags.active));
        return fetchApi<Record<string, unknown>>(`/admin/users?${query}`, {}, this.config.configDir);
      };

      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: ['id', 'username', 'displayName', 'email', 'active', 'createdAt'],
        fields: flags.fields,
        json: flags.json,
        noun: 'users',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
