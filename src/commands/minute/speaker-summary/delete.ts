import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MinuteSpeakerSummaryDelete extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    summaryId: Args.string({ description: 'Speaker summary ID', required: true }),
  };
  static description = 'Delete a speaker summary';

  public async run(): Promise<void> {
    const { args } = await this.parse(MinuteSpeakerSummaryDelete);

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries/${args.summaryId}`,
        { method: 'DELETE' },
        this.config.configDir
      );
      this.log('✅ Speaker summary deleted successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
