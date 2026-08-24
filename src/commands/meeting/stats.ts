import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { resolveDateRange } from '../../utils/validation.js';

export default class MeetingStats extends Command {
  static description = 'Get meeting statistics';
  static flags = {
    date: Flags.string({ description: 'Local calendar day (YYYY-MM-DD)' }),
    'end-date': Flags.string({ aliases: ['endDate'], description: 'Exclusive ISO end date with timezone' }),
    json: jsonFlag,
    'start-date': Flags.string({ aliases: ['startDate'], description: 'Inclusive ISO start date with timezone' }),
    timezone: Flags.string({ default: 'Asia/Shanghai', description: 'IANA timezone used with --date' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingStats);
    try {
      const range = resolveDateRange({
        date: flags.date, endDate: flags['end-date'], startDate: flags['start-date'], timeZone: flags.timezone,
      });
      const query = new URLSearchParams();
      if (range.startDate) query.set('startDate', range.startDate);
      if (range.endDate) query.set('endDate', range.endDate);
      const suffix = query.size > 0 ? `?${query}` : '';
      const data = await fetchApi(`/meetings/stats/summary${suffix}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
