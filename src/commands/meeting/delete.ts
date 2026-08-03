import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MeetingDelete extends Command {
  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };
static description = 'Delete a meeting record';

  public async run(): Promise<void> {
    const { args } = await this.parse(MeetingDelete);

    try {
      const data = await fetchApi(`/meetings/${args.id}`, { method: 'DELETE' }, this.config.configDir);
      this.log('✅ Meeting deleted successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
