import { Command, Flags } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { validateImportFile } from '../../utils/validation.js';

export default class UserImport extends Command {
  static description = 'Import users from a CSV or XLSX file';
  static flags = {
    file: Flags.string({ description: 'Path to the file to import', required: true }),
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserImport);

    try {
      validateImportFile(flags.file);
      const fileBuffer = readFileSync(flags.file);
      const fileBlob = new globalThis.Blob([fileBuffer]);
      const formData = new globalThis.FormData();
      formData.append('file', fileBlob, basename(flags.file));

      const data = await fetchApi(
        `/admin/users/import`,
        {
          body: formData,
          method: 'POST',
        },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Users imported successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
