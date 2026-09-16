import { Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';
import { normalizeDriveNodeName } from '../../../utils/validation.js';

export default class DriveFolderCreate extends NoveCommand {
  static aliases = ['drive:mkdir', 'drive mkdir'];
  static description = 'Create a new folder in a cloud drive space';
  static flags = {
    json: jsonFlag,
    name: Flags.string({ description: 'Folder name', required: true }),
    'parent-id': Flags.string({ aliases: ['parentId'], description: 'Parent folder ID' }),
    'space-id': Flags.string({ aliases: ['spaceId'], description: 'Drive space ID', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveFolderCreate);
    try {
      const name = normalizeDriveNodeName(flags.name);
      const data = await fetchApi(
        '/drive/folders',
        {
          body: JSON.stringify({
            name,
            parentId: flags['parent-id'],
            spaceId: flags['space-id'],
          }),
          method: 'POST',
        },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Folder "${name}" created successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
