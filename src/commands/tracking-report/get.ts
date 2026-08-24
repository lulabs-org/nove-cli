import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class TrackingReportGet extends NoveCommand {
  static args = { id: Args.string({ description: 'Tracking report ID', required: true }) };
  static description = 'Get a tracking report by ID';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(TrackingReportGet);
    try {
      const data = await fetchApi(`/tracking-reports/${args.id}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
