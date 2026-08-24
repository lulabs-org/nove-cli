import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { MEETING_PLATFORMS, MEETING_TYPES, validateDateRange } from '../../utils/validation.js';

export default class MeetingCreate extends Command {
  static description = 'Create a meeting record';
  static flags = {
    'actual-start-at': Flags.string({ aliases: ['startTime'], description: 'Actual start time as ISO 8601 with timezone' }),
    'duration-seconds': Flags.integer({ description: 'Duration in seconds', min: 0 }),
    'ended-at': Flags.string({ aliases: ['endTime'], description: 'End time as ISO 8601 with timezone' }),
    json: jsonFlag,
    'meeting-code': Flags.string({ description: 'Meeting code' }),
    platform: Flags.string({ description: 'Meeting platform', options: [...MEETING_PLATFORMS], required: true }),
    'platform-meeting-id': Flags.string({ aliases: ['platformMeetingId'], description: 'Platform Meeting ID', required: true }),
    title: Flags.string({ description: 'Meeting title', required: true }),
    type: Flags.string({ description: 'Meeting type', options: [...MEETING_TYPES], required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingCreate);
    try {
      validateDateRange(flags['actual-start-at'], flags['ended-at']);
      const data = await fetchApi('/meetings', {
        body: JSON.stringify({
          actualStartAt: flags['actual-start-at'],
          durationSeconds: flags['duration-seconds'],
          endedAt: flags['ended-at'],
          meetingCode: flags['meeting-code'],
          platform: flags.platform,
          platformMeetingId: flags['platform-meeting-id'],
          title: flags.title,
          type: flags.type,
        }),
        method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Meeting created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
