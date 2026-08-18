import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';

export default class MeetingRecordingDelete extends Command {
  static args = {
    id: Args.string({ description: 'Recording ID', required: true }),
  };
static description = 'Delete a meeting recording';

  public async run(): Promise<void> {
    const { args } = await this.parse(MeetingRecordingDelete);

    try {
      const data = await fetchApi(
        `/recordings/${args.id}`,
        {
          method: 'DELETE',
        },
        this.config.configDir
      );
      this.log('✅ Meeting recording deleted successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
