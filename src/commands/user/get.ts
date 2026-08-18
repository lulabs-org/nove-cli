import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class UserGet extends Command {
  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  };
  static description = 'Get user details by ID';

  public async run(): Promise<void> {
    const { args } = await this.parse(UserGet);

    try {
      const data = await fetchApi(`/admin/users/${args.id}`, {}, this.config.configDir);
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
