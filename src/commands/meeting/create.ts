import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MeetingCreate extends Command {
  static description = 'Create a meeting record';
static flags = {
    endTime: Flags.string({ description: 'End time (ISO string)' }),
    json: jsonFlag,
    platformMeetingId: Flags.string({ description: 'Platform Meeting ID (e.g. feishu ID)', required: true }),
    startTime: Flags.string({ description: 'Start time (ISO string)' }),
    status: Flags.string({ description: 'Status (e.g. COMPLETED)' }),
    title: Flags.string({ description: 'Meeting title', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingCreate);

    try {
      const data = await fetchApi(
        `/meetings`,
        {
          body: JSON.stringify({
            endTime: flags.endTime,
            platformMeetingId: flags.platformMeetingId,
            startTime: flags.startTime,
            status: flags.status,
            title: flags.title,
          }),
          method: 'POST',
        },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Meeting created successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
