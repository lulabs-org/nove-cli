import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveFileGet extends NoveCommand {
  static aliases = ['drive:get', 'drive get'];
  static args = {
    fileId: Args.string({ description: 'File ID', required: true }),
  };
  static description = 'Get file details and active version information';
  static flags = {
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveFileGet);
    try {
      const data = await fetchApi(`/drive/files/${args.fileId}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
