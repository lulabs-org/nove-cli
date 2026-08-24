import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MeetingUpdate extends Command {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Update a meeting record';
static flags = {
    json: jsonFlag,
    status: Flags.string({ description: 'New status' }),
    title: Flags.string({ description: 'New meeting title' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingUpdate);

    // Remove undefined flags
    const body = Object.fromEntries(
      Object.entries(flags).filter(([key, value]) => key !== 'json' && value !== undefined)
    );

    if (Object.keys(body).length === 0) {
      handleCommandError(
        this,
        new Error('No update parameters provided. Use --title or --status.'),
        flags.json
      );
    }

    try {
      const data = await fetchApi(
        `/meetings/${args.id}`,
        {
          body: JSON.stringify(body),
          method: 'PUT',
        },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Meeting updated successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
