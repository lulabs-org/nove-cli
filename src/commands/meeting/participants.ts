import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MeetingParticipants extends Command {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Get participants for a meeting';
static flags = {
    keyword: Flags.string({ description: 'Search keyword' }),
    limit: Flags.integer({ default: 20, description: 'Items per page' }),
    page: Flags.integer({ default: 1, description: 'Page number' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingParticipants);

    try {
      const queryParams = new URLSearchParams({
        limit: flags.limit.toString(),
        page: flags.page.toString(),
      });
      
      if (flags.keyword) queryParams.append('keyword', flags.keyword);

      const data = await fetchApi(
        `/meetings/${args.id}/participants?${queryParams.toString()}`,
        {},
        this.config.configDir
      );
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
