import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MinuteSpeakerSummaryUpdate extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    summaryId: Args.string({ description: 'Speaker summary ID', required: true }),
  };
  static description = 'Update a speaker summary';
  static flags = {
    keywords: Flags.string({ description: 'Summary keyword (repeat for multiple)', multiple: true }),
    partSummary: Flags.string({ description: 'Speaker summary text' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryUpdate);

    if (Object.keys(flags).length === 0) this.error('No fields provided to update.');

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries/${args.summaryId}`,
        { body: JSON.stringify(flags), method: 'PUT' },
        this.config.configDir
      );
      this.log('✅ Speaker summary updated successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
