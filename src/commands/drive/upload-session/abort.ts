import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveUploadSessionAbort extends NoveCommand {
  static aliases = ['drive:abort-upload', 'drive abort-upload'];
  static args = {
    id: Args.string({ description: 'Upload session ID to abort', required: true }),
  };
  static description = 'Abort an in-progress upload session';
  static flags = {
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveUploadSessionAbort);
    try {
      const data = await fetchApi(
        `/drive/upload-sessions/${args.id}`,
        { method: 'DELETE' },
        this.config.configDir
      );

      outputResult(this, data, {
        json: flags.json,
        successMessage: `Upload session ${args.id} aborted successfully.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
