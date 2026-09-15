import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveFileDownloadUrl extends NoveCommand {
  static aliases = ['drive:download-url', 'drive download-url'];
  static args = {
    fileId: Args.string({ description: 'File ID', required: true }),
  };
  static description = 'Get a temporary download URL for a file';
  static flags = {
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveFileDownloadUrl);
    try {
      const data = await fetchApi(
        `/drive/files/${args.fileId}/download-url`,
        { method: 'POST' },
        this.config.configDir
      );

      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
