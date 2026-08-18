import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class UserDelete extends Command {
  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  };
  static description = 'Delete a user by ID';

  public async run(): Promise<void> {
    const { args } = await this.parse(UserDelete);

    try {
      await fetchApi(
        `/admin/users/${args.id}`,
        { method: 'DELETE' },
        this.config.configDir
      );
      this.log('✅ User deleted successfully.');
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
