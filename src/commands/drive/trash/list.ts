import { Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { fieldsFlag, outputList, sortFlag, validateListFlags } from '../../../utils/list-output.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

interface TrashListResponse {
  items: unknown[];
}

export default class DriveTrashList extends NoveCommand {
  static description = 'List trashed items in a cloud drive space';
  static flags = {
    fields: fieldsFlag,
    json: jsonFlag,
    sort: sortFlag,
    'space-id': Flags.string({ aliases: ['spaceId'], description: 'Drive space ID', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveTrashList);
    try {
      validateListFlags(flags);
      const data = await fetchApi<TrashListResponse>(
        `/drive/trash?spaceId=${encodeURIComponent(flags['space-id'])}`,
        {},
        this.config.configDir
      );

      if (flags.json) {
        outputResult(this, data, { json: true });
        return;
      }

      outputList(
        this,
        { items: data.items, total: data.items.length },
        {
          defaultFields: ['id', 'name', 'type', 'sizeBytes', 'deletedAt'],
          fields: flags.fields,
          noun: 'trashed items',
          sort: flags.sort,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
