import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';
import { normalizeDriveNodeName } from '../../../utils/validation.js';

export default class DriveNodeUpdate extends NoveCommand {
  static aliases = ['drive:update', 'drive update'];
  static args = {
    nodeId: Args.string({ description: 'Node ID', required: true }),
  };
  static description = 'Update a file or folder name or ACL inheritance';
  static flags = {
    'inherit-acl': Flags.boolean({ allowNo: true, description: 'Inherit ACL from parent folder' }),
    json: jsonFlag,
    name: Flags.string({ description: 'New name for the file or folder' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveNodeUpdate);
    try {
      if (flags.name === undefined && flags['inherit-acl'] === undefined) {
        throw new Error('No fields provided to update.');
      }

      const payload: Record<string, unknown> = {};
      if (flags.name !== undefined) {
        payload.name = normalizeDriveNodeName(flags.name);
      }

      if (flags['inherit-acl'] !== undefined) {
        payload.inheritAcl = flags['inherit-acl'];
      }

      const data = await fetchApi(
        `/drive/nodes/${args.nodeId}`,
        {
          body: JSON.stringify(payload),
          method: 'PATCH',
        },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Node ${args.nodeId} updated successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
