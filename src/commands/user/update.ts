import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { adminUserBody, adminUserFlags } from '../../utils/user-input.js';

export default class UserUpdate extends Command {
  static args = { id: Args.string({ description: 'User ID', required: true }) };
  static description = 'Update an existing user';
  static flags = { ...adminUserFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UserUpdate);
    try {
      const body = adminUserBody(flags);
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');
      const data = await fetchApi(`/admin/users/${args.id}`, {
        body: JSON.stringify(body), method: 'PATCH',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'User updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
