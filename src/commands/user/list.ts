import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class UserList extends Command {
  static description = 'List users';
  static flags = {
    active: Flags.boolean({ allowNo: true, description: 'Filter by active status' }),
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search keyword (username, email, phone, display name)' }),
    limit: Flags.integer({ default: 20, description: 'Items per page' }),
    page: Flags.integer({ default: 1, description: 'Page number' }),
    sortBy: Flags.string({ default: 'createdAt', description: 'Sort field (createdAt, updatedAt, lastLoginAt, username, email)' }),
    sortOrder: Flags.string({ default: 'desc', description: 'Sort order (asc, desc)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserList);

    try {
      const queryParams = new URLSearchParams({
        page: flags.page.toString(),
        pageSize: flags.limit.toString(),
        sortBy: flags.sortBy,
        sortOrder: flags.sortOrder,
      });
      
      if (flags.keyword) queryParams.append('keyword', flags.keyword);
      if (flags.active !== undefined) queryParams.append('active', flags.active.toString());

      const data = await fetchApi(`/admin/users?${queryParams.toString()}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
