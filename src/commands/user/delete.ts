import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class UserDelete extends NoveCommand {
  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  };
  static description = 'Delete a user by ID';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UserDelete);

    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'user' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete user ${args.id}? This action cannot be undone.`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'user' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/admin/users/${args.id}`,
        { method: 'DELETE' },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ User deleted successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
