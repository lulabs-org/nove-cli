import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MeetingGet extends Command {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Get a meeting by ID';

  public async run(): Promise<void> {
    const { args } = await this.parse(MeetingGet);

    try {
      const data = await fetchApi(`/meetings/${args.id}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
