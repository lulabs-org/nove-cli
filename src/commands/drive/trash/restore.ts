import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveTrashRestore extends NoveCommand {
  static args = {
    nodeId: Args.string({ description: 'Node ID to restore from trash', required: true }),
  };
  static description = 'Restore a file or folder from trash';
  static flags = {
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveTrashRestore);
    try {
      const data = await fetchApi(
        `/drive/nodes/${args.nodeId}/restore`,
        { method: 'POST' },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Drive node ${args.nodeId} restored successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
