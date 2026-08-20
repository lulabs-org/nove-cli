import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MinuteDelete extends Command {
  static args = {
    id: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Delete a meeting minute';

  public async run(): Promise<void> {
    const { args } = await this.parse(MinuteDelete);

    try {
      const data = await fetchApi(
        `/minutes/${args.id}`,
        {
          method: 'DELETE',
        },
        this.config.configDir
      );
      this.log('✅ Meeting minute deleted successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
