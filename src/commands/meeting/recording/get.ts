import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MeetingRecordingGet extends Command {
  static args = {
    id: Args.string({ description: 'Recording ID', required: true }),
  };
static description = 'Get details of a meeting recording';

  public async run(): Promise<void> {
    const { args } = await this.parse(MeetingRecordingGet);

    try {
      const data = await fetchApi(`/recordings/${args.id}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
