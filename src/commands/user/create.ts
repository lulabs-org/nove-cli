
import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { adminUserBody, adminUserFlags } from '../../utils/user-input.js';

export default class UserCreate extends NoveCommand {
  static description = 'Create a new user';
  static flags = { ...adminUserFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserCreate);
    try {
      const body = adminUserBody(flags, { requirePhonePair: true });
      if (!body.username && !body.email && !body.phone) {
        throw new Error('At least one of username, email, or phone is required.');
      }

      const data = await fetchApi('/admin/users', {
        body: JSON.stringify(body), method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'User created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
