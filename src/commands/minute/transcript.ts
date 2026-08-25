import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MinuteTranscript extends NoveCommand {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Get transcript for a meeting minute';
static flags = {
    format: Flags.string({ default: 'text', description: 'Format (text or json)', options: ['text', 'json'] }),
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteTranscript);

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/transcript?format=${flags.format}`,
        {},
        this.config.configDir
      );
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
