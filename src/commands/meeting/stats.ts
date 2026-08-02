import { Command, Flags } from '@oclif/core';
import { fetchApi } from '../../utils/api.js';

export default class MeetingStats extends Command {
  static description = 'Get meeting statistics';

  static flags = {
    startDate: Flags.string({ description: 'Start date (ISO string)' }),
    endDate: Flags.string({ description: 'End date (ISO string)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingStats);

    try {
      const queryParams = new URLSearchParams();
      if (flags.startDate) queryParams.append('startDate', flags.startDate);
      if (flags.endDate) queryParams.append('endDate', flags.endDate);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const data = await fetchApi(`/meetings/stats/summary${qs}`, {}, this.config.configDir);
      
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
