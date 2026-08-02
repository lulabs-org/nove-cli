import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MeetingList extends Command {
  static description = 'List meetings';
static flags = {
    endDate: Flags.string({ description: 'End date (ISO string)' }),
    limit: Flags.integer({ default: 10, description: 'Items per page' }),
    page: Flags.integer({ default: 1, description: 'Page number' }),
    platform: Flags.string({ description: 'Platform (e.g. TENCENT_MEETING, FEISHU)' }),
    search: Flags.string({ description: 'Search keyword' }),
    startDate: Flags.string({ description: 'Start date (ISO string)' }),
    status: Flags.string({ description: 'Processing status (e.g. COMPLETED, PENDING)' }),
    type: Flags.string({ description: 'Meeting type (e.g. SCHEDULED, INSTANT)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingList);

    try {
      const queryParams = new URLSearchParams({
        limit: flags.limit.toString(),
        page: flags.page.toString(),
      });
      
      if (flags.platform) queryParams.append('platform', flags.platform);
      if (flags.status) queryParams.append('status', flags.status);
      if (flags.type) queryParams.append('type', flags.type);
      if (flags.startDate) queryParams.append('startDate', flags.startDate);
      if (flags.endDate) queryParams.append('endDate', flags.endDate);
      if (flags.search) queryParams.append('search', flags.search);

      const data = await fetchApi(`/meetings?${queryParams.toString()}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
