import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../../utils/destructive-action.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveNodeDelete extends NoveCommand {
  static aliases = ['drive:delete', 'drive delete'];
  static args = {
    nodeId: Args.string({ description: 'Node ID to move to trash', required: true }),
  };
  static description = 'Move a file or folder to the trash';
  static flags = {
    ...destructiveFlags,
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveNodeDelete);
    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.nodeId, resource: 'drive-node' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Move drive node ${args.nodeId} to trash?`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.nodeId, resource: 'drive-node' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/drive/nodes/${args.nodeId}`,
        { method: 'DELETE' },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Drive node ${args.nodeId} moved to trash successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
