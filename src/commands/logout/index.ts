
import { Flags } from '@oclif/core';

import { getStoredAuth, removeCredential } from '../../utils/auth.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { revokeOAuthCredential } from '../../utils/oauth.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class Logout extends NoveCommand {
  static description = 'Revoke OAuth access and remove the locally stored credential';
  static flags = {
    json: jsonFlag,
    'local-only': Flags.boolean({ description: 'Remove local OAuth state without contacting the API' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Logout);
    try {
      const auth = getStoredAuth(this.config.configDir);
      if (auth?.method === 'oauth' && !flags['local-only']) {
        await revokeOAuthCredential(this.config.configDir);
      }

      const removed = removeCredential(this.config.configDir);
      outputResult(this, { authenticated: false, removed }, {
        json: flags.json,
        successMessage: removed ? 'Logged out successfully.' : 'No stored credential was found.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
