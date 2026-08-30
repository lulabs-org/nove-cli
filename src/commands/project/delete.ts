import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

interface ProjectPreview {
  id?: string;
  status?: string;
  title?: string;
}

export default class ProjectDelete extends NoveCommand {
  static args = { id: Args.string({ description: 'Project ID', required: true }) };
  static description = 'Soft delete a project after reading the exact target';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectDelete);
    try {
      const target = await fetchApi(`/admin/projects/${args.id}`, {}, this.config.configDir) as ProjectPreview;
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, resource: 'project', target }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Soft delete project ${target.title ?? args.id} (${target.id ?? args.id}, ${target.status ?? 'unknown status'})?`,
        flags.yes,
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, resource: 'project', target }, { json: flags.json });
        return;
      }

      const data = await fetchApi(`/admin/projects/${args.id}`, { method: 'DELETE' }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Project deleted successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
