import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../../utils/destructive-action.js';
import { handleCommandError, jsonFlag, outputResult } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryDelete extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    summaryId: Args.string({ description: 'Speaker summary ID', required: true }),
  };
  static description = 'Delete a speaker summary';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryDelete);

    try {
      const resource = {
        minuteId: args.minuteId,
        resource: 'speaker-summary',
        summaryId: args.summaryId,
      };
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, ...resource }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete speaker summary ${args.summaryId} from minute ${args.minuteId}? This action cannot be undone.`,
        flags.yes
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, ...resource }, { json: flags.json });
        return;
      }

      const data = await fetchApi(
        `/minutes/${args.minuteId}/speaker-summaries/${args.summaryId}`,
        { method: 'DELETE' },
        this.config.configDir
      );
      outputResult(this, data, {
        json: flags.json,
        successMessage: '✅ Speaker summary deleted successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
