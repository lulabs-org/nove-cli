import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { validateDateRange } from '../../utils/validation.js';

const MAX_DATE_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

export default class MinuteMeetingTranscripts extends NoveCommand {
  static args = {
    platformUserId: Args.string({ description: 'Platform user ID', required: true }),
  };
  static description = 'Get minutes where a platform user spoke and their transcript segments';
  static flags = {
    'end-date': Flags.string({
      aliases: ['endDate'],
      description: 'Exclusive ISO 8601 end date with explicit timezone',
      required: true,
    }),
    json: jsonFlag,
    'start-date': Flags.string({
      aliases: ['startDate'],
      description: 'Inclusive ISO 8601 start date with explicit timezone',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteMeetingTranscripts);

    try {
      validateDateRange(flags['start-date'], flags['end-date']);
      if (Date.parse(flags['end-date']) - Date.parse(flags['start-date']) > MAX_DATE_RANGE_MS) {
        throw new Error('Date range cannot exceed 31 days.');
      }

      const query = new URLSearchParams({
        endDate: flags['end-date'],
        startDate: flags['start-date'],
      });
      const data = await fetchApi(
        `/platform-users/${args.platformUserId}/minute-transcripts?${query}`,
        {},
        this.config.configDir,
      );
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
