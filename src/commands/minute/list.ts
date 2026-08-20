import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MinuteList extends Command {
  static description = 'List meeting minutes';
static flags = {
    limit: Flags.integer({ default: 10, description: 'Items per page' }),
    meetingId: Flags.string({ description: 'Filter by Meeting ID' }),
    page: Flags.integer({ default: 1, description: 'Page number' }),
    source: Flags.string({ description: 'Minute source (e.g. PLATFORM_AUTO, UPLOAD)' }),
    status: Flags.string({ description: 'Minute status (e.g. PROCESSING, COMPLETED, FAILED)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MinuteList);

    try {
      const queryParams = new URLSearchParams({
        limit: flags.limit.toString(),
        page: flags.page.toString(),
      });
      
      if (flags.meetingId) queryParams.append('meetingId', flags.meetingId);
      if (flags.source) queryParams.append('source', flags.source);
      if (flags.status) queryParams.append('status', flags.status);

      const data = await fetchApi(`/minutes?${queryParams.toString()}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
