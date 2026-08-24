import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryUpdate extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    summaryId: Args.string({ description: 'Speaker summary ID', required: true }),
  };
  static description = 'Update a speaker summary';
  static flags = {
    json: jsonFlag,
    keywords: Flags.string({ description: 'Summary keyword (repeat for multiple)', multiple: true }),
    partSummary: Flags.string({ description: 'Speaker summary text' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryUpdate);

    const { json, ...body } = flags;
    if (Object.keys(body).length === 0) {
      handleCommandError(this, new Error('No fields provided to update.'), json);
    }

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries/${args.summaryId}`,
        { body: JSON.stringify(body), method: 'PUT' },
        this.config.configDir
      );
      outputResult(this, data, {
        json,
        successMessage: '✅ Speaker summary updated successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, json);
    }
  }
}
