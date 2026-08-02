import { Command, Args } from '@oclif/core';
import { fetchApi } from '../../utils/api.js';

export default class MeetingGet extends Command {
  static description = 'Get a meeting by ID';

  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(MeetingGet);

    try {
      const data = await fetchApi(`/meetings/${args.id}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
