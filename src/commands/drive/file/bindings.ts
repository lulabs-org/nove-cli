import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { fieldsFlag, outputList, sortFlag, validateListFlags } from '../../../utils/list-output.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveFileBindings extends NoveCommand {
  static aliases = ['drive:bindings', 'drive bindings'];
  static args = {
    fileId: Args.string({ description: 'File ID', required: true }),
  };
  static description = 'List business entity bindings for a file';
  static flags = {
    fields: fieldsFlag,
    json: jsonFlag,
    sort: sortFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveFileBindings);
    try {
      validateListFlags(flags);
      const bindings = await fetchApi<Array<Record<string, unknown>>>(
        `/drive/files/${args.fileId}/bindings`,
        {},
        this.config.configDir
      );

      if (flags.json) {
        outputResult(this, bindings, { json: true });
        return;
      }

      outputList(
        this,
        { items: bindings, total: bindings.length },
        {
          defaultFields: ['id', 'targetType', 'targetId', 'fieldKey', 'purpose', 'active'],
          fields: flags.fields,
          noun: 'file bindings',
          sort: flags.sort,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
