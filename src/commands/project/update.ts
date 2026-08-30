import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { projectBody, projectUpdateFlags } from '../../utils/project-input.js';

export default class ProjectUpdate extends NoveCommand {
  static args = { id: Args.string({ description: 'Project ID', required: true }) };
  static description = 'Update a project in the current organization';
  static flags = { ...projectUpdateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectUpdate);
    try {
      const body = projectBody(flags);
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');
      const data = await fetchApi(`/admin/projects/${args.id}`, {
        body: JSON.stringify(body),
        method: 'PUT',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Project updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
