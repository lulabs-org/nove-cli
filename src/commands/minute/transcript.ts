import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MinuteTranscript extends Command {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Get transcript for a meeting minute';
static flags = {
    format: Flags.string({ default: 'text', description: 'Format (text or json)', options: ['text', 'json'] }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteTranscript);

    try {
      const data = await fetchApi(
        `/minutes/${args.minuteId}/transcript?format=${flags.format}`,
        {},
        this.config.configDir
      );
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
