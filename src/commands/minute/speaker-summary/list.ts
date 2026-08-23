import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MinuteSpeakerSummaryList extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
  static description = 'List speaker summaries for a meeting minute';
  static flags = {
    limit: Flags.integer({ default: 20, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryList);
    const query = new URLSearchParams({ limit: String(flags.limit), page: String(flags.page) });

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries?${query.toString()}`,
        {},
        this.config.configDir
      );
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
