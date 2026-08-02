import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MeetingTranscript extends Command {
  static args = {
    recordingId: Args.string({ description: 'Recording ID', required: true }),
  };
static description = 'Get transcript for a meeting recording';
static flags = {
    format: Flags.string({ default: 'text', description: 'Format (text or json)', options: ['text', 'json'] }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingTranscript);

    try {
      const data = await fetchApi(
        `/meetings/recordings/${args.recordingId}/transcript?format=${flags.format}`,
        {},
        this.config.configDir
      );
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
