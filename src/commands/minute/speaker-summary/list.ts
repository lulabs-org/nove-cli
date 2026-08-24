import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryList extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
  static description = 'List speaker summaries for a meeting minute';
  static flags = {
    json: jsonFlag,
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
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
