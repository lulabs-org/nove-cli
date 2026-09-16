import { Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';
import { DRIVE_ACTIONS, DRIVE_GRANT_EFFECTS, DRIVE_PRINCIPAL_TYPES } from '../../../utils/validation.js';

export default class DriveGrantSet extends NoveCommand {
  static description = 'Create or update an access grant on a drive space root or node';
  static flags = {
    action: Flags.string({
      description: 'Allowed or denied actions (specify multiple times for multiple actions)',
      multiple: true,
      options: [...DRIVE_ACTIONS],
      required: true,
    }),
    effect: Flags.string({
      description: 'Grant effect (ALLOW or DENY)',
      options: [...DRIVE_GRANT_EFFECTS],
      required: true,
    }),
    json: jsonFlag,
    'node-id': Flags.string({
      aliases: ['nodeId'],
      description: 'Target Node ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
    'principal-id': Flags.string({
      aliases: ['principalId'],
      description: 'Principal ID (user ID, org ID, member ID, etc.)',
      required: true,
    }),
    'principal-type': Flags.string({
      aliases: ['principalType'],
      description: 'Principal type',
      options: [...DRIVE_PRINCIPAL_TYPES],
      required: true,
    }),
    'space-id': Flags.string({
      aliases: ['spaceId'],
      description: 'Target Space ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveGrantSet);
    try {
      const endpoint = flags['space-id']
        ? `/drive/spaces/${flags['space-id']}/grants`
        : `/drive/nodes/${flags['node-id']}/grants`;

      const payload = {
        actions: flags.action,
        effect: flags.effect,
        principalId: flags['principal-id'],
        principalType: flags['principal-type'],
      };

      const data = await fetchApi(
        endpoint,
        {
          body: JSON.stringify(payload),
          method: 'PUT',
        },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: 'Drive grant configured successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
