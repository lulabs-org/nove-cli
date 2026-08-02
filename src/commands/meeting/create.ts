import { Command, Flags } from '@oclif/core';
import { fetchApi } from '../../utils/api.js';

export default class MeetingCreate extends Command {
  static description = 'Create a meeting record';

  static flags = {
    platformMeetingId: Flags.string({ description: 'Platform Meeting ID (e.g. feishu ID)', required: true }),
    title: Flags.string({ description: 'Meeting title', required: true }),
    startTime: Flags.string({ description: 'Start time (ISO string)' }),
    endTime: Flags.string({ description: 'End time (ISO string)' }),
    status: Flags.string({ description: 'Status (e.g. COMPLETED)' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingCreate);

    try {
      const data = await fetchApi(
        `/meetings`,
        {
          method: 'POST',
          body: JSON.stringify({
            platformMeetingId: flags.platformMeetingId,
            title: flags.title,
            startTime: flags.startTime,
            endTime: flags.endTime,
            status: flags.status,
          }),
        },
        this.config.configDir
      );
      this.log('✅ Meeting created successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
