import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../../utils/destructive-action.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveTrashPurge extends NoveCommand {
  static args = {
    nodeId: Args.string({ description: 'Node ID to permanently purge from trash', required: true }),
  };
  static description = 'Permanently purge a trashed node and its storage objects';
  static flags = {
    ...destructiveFlags,
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveTrashPurge);
    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.nodeId, resource: 'drive-trash-node' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Permanently purge drive node ${args.nodeId}? This action cannot be undone.`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.nodeId, resource: 'drive-trash-node' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/drive/trash/${args.nodeId}/purge`,
        { method: 'DELETE' },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Drive node ${args.nodeId} permanently purged successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
