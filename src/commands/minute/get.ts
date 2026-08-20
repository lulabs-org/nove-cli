import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class MinuteGet extends Command {
  static args = {
    id: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Get details of a meeting minute';

  public async run(): Promise<void> {
    const { args } = await this.parse(MinuteGet);

    try {
      const data = await fetchApi(`/minutes/${args.id}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
