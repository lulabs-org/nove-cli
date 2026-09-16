import { fetchApi } from '../../../utils/api.js';
import { fieldsFlag, outputList, sortFlag, validateListFlags } from '../../../utils/list-output.js';
import { NoveCommand } from '../../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class DriveSpaceList extends NoveCommand {
  static description = 'List accessible cloud drive spaces';
  static flags = {
    fields: fieldsFlag,
    json: jsonFlag,
    sort: sortFlag,
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveSpaceList);
    try {
      validateListFlags(flags);
      const spaces = await fetchApi<Array<Record<string, unknown>>>('/drive/spaces', {}, this.config.configDir);
      if (flags.json) {
        outputResult(this, spaces, { json: true });
        return;
      }

      outputList(
        this,
        { items: spaces, total: spaces.length },
        {
          defaultFields: ['id', 'name', 'type', 'orgId'],
          fields: flags.fields,
          noun: 'drive spaces',
          sort: flags.sort,
        }
      );
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
