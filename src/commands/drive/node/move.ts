import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveNodeMove extends NoveCommand {
  static aliases = ['drive:move', 'drive move'];
  static args = {
    nodeId: Args.string({ description: 'Node ID to move', required: true }),
  };
  static description = 'Move a file or folder to a different parent directory';
  static flags = {
    json: jsonFlag,
    'parent-id': Flags.string({ aliases: ['parentId'], description: 'Target parent folder ID', exclusive: ['root'] }),
    root: Flags.boolean({ description: 'Move to space root directory', exclusive: ['parent-id'] }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveNodeMove);
    try {
      const parentId = flags.root ? null : (flags['parent-id'] ?? null);
      const data = await fetchApi(
        `/drive/nodes/${args.nodeId}/move`,
        {
          body: JSON.stringify({ parentId }),
          method: 'POST',
        },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Node ${args.nodeId} moved successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
