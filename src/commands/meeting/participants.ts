import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MeetingParticipants extends Command {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Get participants for a meeting';
static flags = {
    json: jsonFlag,
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
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
