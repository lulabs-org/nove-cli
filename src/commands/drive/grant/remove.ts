import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../../utils/destructive-action.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveGrantRemove extends NoveCommand {
  static args = {
    grantId: Args.string({ description: 'Grant ID to remove', required: true }),
  };
  static description = 'Remove an access grant from a drive space root or node';
  static flags = {
    ...destructiveFlags,
    json: jsonFlag,
    'node-id': Flags.string({
      aliases: ['nodeId'],
      description: 'Node ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
    'space-id': Flags.string({
      aliases: ['spaceId'],
      description: 'Space ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveGrantRemove);
    try {
      const targetDesc = flags['space-id'] ? `space ${flags['space-id']}` : `node ${flags['node-id']}`;
      if (flags['dry-run']) {
        outputResult(
          this,
          { dryRun: true, grantId: args.grantId, resource: 'drive-grant', target: targetDesc },
          { json: flags.json }
        );
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Remove drive grant ${args.grantId} from ${targetDesc}?`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(
          this,
          { cancelled: true, grantId: args.grantId, resource: 'drive-grant', target: targetDesc },
          { json: flags.json }
        );
        return;
      }

      const endpoint = flags['space-id']
        ? `/drive/spaces/${flags['space-id']}/grants/${args.grantId}`
        : `/drive/nodes/${flags['node-id']}/grants/${args.grantId}`;

      const data = await fetchApi(endpoint, { method: 'DELETE' }, this.config.configDir);
      outputResult(this, data, {
        json: flags.json,
        successMessage: `Drive grant ${args.grantId} removed successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
