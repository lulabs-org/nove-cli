import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

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
    json: jsonFlag,
    keywords: Flags.string({ description: 'Summary keyword (repeat for multiple)', multiple: true }),
    partSummary: Flags.string({ description: 'Speaker summary text', required: true }),
    platformUserId: Flags.string({ description: 'Platform user ID', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryCreate);
    const { json, ...body } = flags;

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries`,
        { body: JSON.stringify(body), method: 'POST' },
        this.config.configDir
      );
      outputResult(this, data, {
        json,
        successMessage: '✅ Speaker summary created successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, json);
    }
  }
}
