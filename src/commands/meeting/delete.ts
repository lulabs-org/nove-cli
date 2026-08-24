import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MeetingDelete extends NoveCommand {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Delete a meeting record';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingDelete);

    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'meeting' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete meeting ${args.id}? This action cannot be undone.`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'meeting' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(`/meetings/${args.id}`, { method: 'DELETE' }, this.config.configDir);
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Meeting deleted successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
