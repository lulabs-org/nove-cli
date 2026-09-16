import { Args, Flags } from '@oclif/core';

import { uploadFileToDrive } from '../../utils/drive-upload.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class DriveUpload extends NoveCommand {
  static args = {
    file: Args.string({ description: 'Path to local file to upload', required: true }),
  };
  static description = 'Upload a file to cloud drive with multipart chunking and integrity check';
  static flags = {
    'content-type': Flags.string({ aliases: ['contentType'], description: 'Override MIME content type' }),
    'file-name': Flags.string({ aliases: ['fileName'], description: 'Override file name' }),
    json: jsonFlag,
    'parent-id': Flags.string({ aliases: ['parentId'], description: 'Target parent folder ID' }),
    'space-id': Flags.string({ aliases: ['spaceId'], description: 'Drive space ID', required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveUpload);
    try {
      const result = await uploadFileToDrive({
        configDir: this.config.configDir,
        contentType: flags['content-type'],
        fileName: flags['file-name'],
        filePath: args.file,
        onProgress: flags.json
          ? undefined
          : (uploaded, total) => {
              this.log(`Uploading: part ${uploaded}/${total}`);
            },
        parentId: flags['parent-id'],
        spaceId: flags['space-id'],
      });

      outputResult(this, result, {
        json: flags.json,
        successMessage: `File uploaded successfully. (ID: ${result.id ?? 'unknown'})`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
