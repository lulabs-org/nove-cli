import { Args, Flags } from '@oclif/core';
import { existsSync, statSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

interface FileDetailsResponse {
  id: string;
  node: {
    id: string;
    name: string;
    sizeBytes: null | string;
  };
  version: {
    contentType: string;
    id: string;
    sizeBytes: string;
  };
}

interface DownloadUrlResponse {
  contentDisposition: string;
  expiresInSeconds: number;
  url: string;
}

export default class DriveDownload extends NoveCommand {
  static args = {
    fileId: Args.string({ description: 'File ID to download', required: true }),
  };
  static description = 'Download a cloud drive file to local disk';
  static flags = {
    json: jsonFlag,
    output: Flags.string({
      char: 'o',
      description: 'Destination file path or directory (defaults to current directory with original filename)',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveDownload);
    try {
      const fileDetails = await fetchApi<FileDetailsResponse>(
        `/drive/files/${args.fileId}`,
        {},
        this.config.configDir
      );

      const downloadInfo = await fetchApi<DownloadUrlResponse>(
        `/drive/files/${args.fileId}/download-url`,
        { method: 'POST' },
        this.config.configDir
      );

      const fileName = fileDetails.node?.name ?? `file-${args.fileId}`;
      const targetPath = flags.output
        ? (existsSync(flags.output) && statSync(flags.output).isDirectory()
            ? path.join(flags.output, fileName)
            : flags.output)
        : path.join(process.cwd(), fileName);

      const response = await globalThis.fetch(downloadInfo.url);
      if (!response.ok) {
        throw new Error(`Failed to download file from object storage: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      await writeFile(targetPath, Buffer.from(arrayBuffer));

      const savedStats = statSync(targetPath);
      outputResult(
        this,
        {
          fileId: args.fileId,
          name: fileName,
          outputPath: path.resolve(targetPath),
          sizeBytes: savedStats.size,
        },
        {
          json: flags.json,
          successMessage: `Downloaded "${fileName}" (${savedStats.size} bytes) to ${path.resolve(targetPath)}.`,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
