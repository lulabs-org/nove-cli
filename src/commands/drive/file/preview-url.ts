import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveFilePreviewUrl extends NoveCommand {
  static aliases = ['drive:preview-url', 'drive preview-url'];
  static args = {
    fileId: Args.string({ description: 'File ID', required: true }),
  };
  static description = 'Get a temporary preview URL for an image or video file';
  static flags = {
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveFilePreviewUrl);
    try {
      const data = await fetchApi(
        `/drive/files/${args.fileId}/preview-url`,
        { method: 'POST' },
        this.config.configDir
      );

      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
