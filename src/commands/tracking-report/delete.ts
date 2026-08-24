import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class TrackingReportDelete extends NoveCommand {
  static args = { id: Args.string({ description: 'Tracking report ID', required: true }) };
  static description = 'Delete a tracking report';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(TrackingReportDelete);
    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'tracking-report' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete tracking report ${args.id}? It will no longer appear in normal queries.`,
        flags.yes,
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'tracking-report' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/tracking-reports/${args.id}`,
        { method: 'DELETE' },
        this.config.configDir,
      );
      outputResult(this, data, { json: flags.json, successMessage: 'Tracking report deleted successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
