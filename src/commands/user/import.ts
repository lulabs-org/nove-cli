import { Command, Flags } from '@oclif/core';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { fetchApi } from '../../utils/api.js';

export default class UserImport extends Command {
  static description = 'Import users from a CSV or XLSX file';
  static flags = {
    file: Flags.string({ description: 'Path to the file to import', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserImport);

    try {
      const fileBuffer = readFileSync(flags.file);
      const fileBlob = new Blob([fileBuffer]);
      // FormData is available with Node.js 18's built-in fetch implementation.
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const formData = new FormData();
      formData.append('file', fileBlob, basename(flags.file));

      const data = await fetchApi(
        `/admin/users/import`,
        {
          body: formData,
          method: 'POST',
        },
        this.config.configDir
      );
      this.log('✅ Users imported successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
