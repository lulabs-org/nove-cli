import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { projectBody, projectCreateFlags } from '../../utils/project-input.js';

export default class ProjectCreate extends NoveCommand {
  static description = 'Create a project in the current organization';
  static flags = { ...projectCreateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProjectCreate);
    try {
      const data = await fetchApi('/admin/projects', {
        body: JSON.stringify(projectBody(flags)),
        method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Project created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
