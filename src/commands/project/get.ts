import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class ProjectGet extends NoveCommand {
  static args = { id: Args.string({ description: 'Project ID', required: true }) };
  static description = 'Get a project by ID in the current organization';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectGet);
    try {
      const data = await fetchApi(`/admin/projects/${args.id}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
