import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryGet extends NoveCommand {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    summaryId: Args.string({ description: 'Speaker summary ID', required: true }),
  };
  static description = 'Get a speaker summary';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryGet);

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries/${args.summaryId}`,
        {},
        this.config.configDir
      );
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
