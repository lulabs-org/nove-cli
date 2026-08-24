import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryCreate extends NoveCommand {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
  static description = 'Create a speaker summary';
  static flags = {
    'ai-model': Flags.string({ aliases: ['aiModel'], description: 'AI model used to generate the summary' }),
    'generated-by': Flags.string({
      aliases: ['generatedBy'],
      description: 'Generation method',
      options: ['AI', 'HYBRID', 'MANUAL'],
    }),
    json: jsonFlag,
    keywords: Flags.string({ description: 'Summary keyword (repeat for multiple)', multiple: true }),
    'part-summary': Flags.string({ aliases: ['partSummary'], description: 'Speaker summary text', required: true }),
    'platform-user-id': Flags.string({ aliases: ['platformUserId'], description: 'Platform user ID', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryCreate);
    const body = {
      aiModel: flags['ai-model'],
      generatedBy: flags['generated-by'],
      keywords: flags.keywords,
      partSummary: flags['part-summary'],
      platformUserId: flags['platform-user-id'],
    };

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries`,
        { body: JSON.stringify(body), method: 'POST' },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Speaker summary created successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
