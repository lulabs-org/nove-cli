import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MinuteSpeakerSummaryCreate extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
  static description = 'Create a speaker summary';
  static flags = {
    aiModel: Flags.string({ description: 'AI model used to generate the summary' }),
    generatedBy: Flags.string({
      description: 'Generation method',
      options: ['AI', 'HYBRID', 'MANUAL'],
    }),
    keywords: Flags.string({ description: 'Summary keyword (repeat for multiple)', multiple: true }),
    partSummary: Flags.string({ description: 'Speaker summary text', required: true }),
    platformUserId: Flags.string({ description: 'Platform user ID', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryCreate);

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries`,
        { body: JSON.stringify(flags), method: 'POST' },
        this.config.configDir
      );
      this.log('✅ Speaker summary created successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
