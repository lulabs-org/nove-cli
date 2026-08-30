import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { PROJECT_STATUSES } from '../../utils/validation.js';

export default class ProjectStatus extends NoveCommand {
  static args = { id: Args.string({ description: 'Project ID', required: true }) };
  static description = 'Update a project status';
  static flags = {
    json: jsonFlag,
    status: Flags.string({ description: 'Project status', options: [...PROJECT_STATUSES], required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectStatus);
    try {
      const data = await fetchApi(`/admin/projects/${args.id}/status`, {
        body: JSON.stringify({ status: flags.status }),
        method: 'PATCH',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Project status updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
