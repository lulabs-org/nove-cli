import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MinuteTranscriptContext extends NoveCommand {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
    platformUserId: Args.string({ description: 'Platform user ID', required: true }),
  };
  static description = 'Get transcript context for a platform user in a meeting minute';
  static flags = {
    depth: Flags.integer({
      description: 'Number of transcript segments before and after each target segment',
      max: 20,
      min: 0,
      required: true,
    }),
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteTranscriptContext);

    try {
      const query = new URLSearchParams({ depth: String(flags.depth) });
      const data = await fetchApi(
        `/platform-users/${args.platformUserId}/minutes/${args.minuteId}/transcript-context?${query}`,
        {},
        this.config.configDir,
      );
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
