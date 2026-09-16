import { Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { fieldsFlag, outputList, sortFlag, validateListFlags } from '../../../utils/list-output.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveGrantList extends NoveCommand {
  static description = 'List access grants for a drive space root or node';
  static flags = {
    fields: fieldsFlag,
    json: jsonFlag,
    'node-id': Flags.string({
      aliases: ['nodeId'],
      description: 'Node ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
    sort: sortFlag,
    'space-id': Flags.string({
      aliases: ['spaceId'],
      description: 'Space ID',
      exactlyOne: ['node-id', 'space-id'],
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveGrantList);
    try {
      validateListFlags(flags);
      const endpoint = flags['space-id']
        ? `/drive/spaces/${flags['space-id']}/grants`
        : `/drive/nodes/${flags['node-id']}/grants`;

      const grants = await fetchApi<Array<Record<string, unknown>>>(endpoint, {}, this.config.configDir);

      if (flags.json) {
        outputResult(this, grants, { json: true });
        return;
      }

      outputList(
        this,
        { items: grants, total: grants.length },
        {
          defaultFields: ['id', 'principalType', 'principalId', 'effect', 'actions'],
          fields: flags.fields,
          noun: 'drive grants',
          sort: flags.sort,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
