import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MinuteDelete extends NoveCommand {
  static args = {
    id: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Delete a meeting minute';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteDelete);

    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'minute' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete minute ${args.id}? This action cannot be undone.`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'minute' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/minutes/${args.id}`,
        {
          method: 'DELETE',
        },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Meeting minute deleted successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
