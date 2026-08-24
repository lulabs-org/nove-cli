import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class UserGet extends Command {
  static args = {
    id: Args.string({ description: 'User ID', required: true }),
  };
  static description = 'Get user details by ID';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UserGet);

    try {
      const data = await fetchApi(`/admin/users/${args.id}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
