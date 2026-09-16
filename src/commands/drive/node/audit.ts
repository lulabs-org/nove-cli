import { Args } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { fieldsFlag, outputList, sortFlag, validateListFlags } from '../../../utils/list-output.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveNodeAudit extends NoveCommand {
  static aliases = ['drive:audit', 'drive audit'];
  static args = {
    nodeId: Args.string({ description: 'Node ID to query audit logs', required: true }),
  };
  static description = 'List audit logs for a cloud drive node';
  static flags = {
    fields: fieldsFlag,
    json: jsonFlag,
    sort: sortFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DriveNodeAudit);
    try {
      validateListFlags(flags);
      const logs = await fetchApi<Array<Record<string, unknown>>>(
        `/drive/nodes/${args.nodeId}/audit`,
        {},
        this.config.configDir
      );

      if (flags.json) {
        outputResult(this, logs, { json: true });
        return;
      }

      outputList(
        this,
        { items: logs, total: logs.length },
        {
          defaultFields: ['id', 'action', 'actorId', 'createdAt'],
          fields: flags.fields,
          noun: 'audit logs',
          sort: flags.sort,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
