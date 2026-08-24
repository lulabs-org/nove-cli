import { Command } from '@oclif/core';

import { removeApiKey } from '../../utils/auth.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class Logout extends Command {
  static description = 'Remove the locally stored Nove API credential';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Logout);
    try {
      const removed = removeApiKey(this.config.configDir);
      outputResult(this, { authenticated: false, removed }, {
        json: flags.json,
        successMessage: removed ? 'Logged out successfully.' : 'No stored credential was found.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
