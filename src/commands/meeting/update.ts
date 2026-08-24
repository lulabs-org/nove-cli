import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { MEETING_TYPES, validateDateRange } from '../../utils/validation.js';

export default class MeetingUpdate extends NoveCommand {
  static args = { id: Args.string({ description: 'Meeting ID', required: true }) };
  static description = 'Update a meeting record';
  static flags = {
    'actual-start-at': Flags.string({ description: 'Actual start time as ISO 8601 with timezone' }),
    'duration-seconds': Flags.integer({ description: 'Duration in seconds', min: 0 }),
    'ended-at': Flags.string({ description: 'End time as ISO 8601 with timezone' }),
    json: jsonFlag,
    'meeting-code': Flags.string({ description: 'Meeting code' }),
    'participant-count': Flags.integer({ description: 'Participant count', min: 0 }),
    title: Flags.string({ description: 'New meeting title' }),
    type: Flags.string({ description: 'Meeting type', options: [...MEETING_TYPES] }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingUpdate);
    try {
      validateDateRange(flags['actual-start-at'], flags['ended-at']);
      const body = Object.fromEntries(Object.entries({
        actualStartAt: flags['actual-start-at'],
        durationSeconds: flags['duration-seconds'],
        endedAt: flags['ended-at'],
        meetingCode: flags['meeting-code'],
        participantCount: flags['participant-count'],
        title: flags.title,
        type: flags.type,
      }).filter(([, value]) => value !== undefined));
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');
      const data = await fetchApi(`/meetings/${args.id}`, {
        body: JSON.stringify(body), method: 'PATCH',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Meeting updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
