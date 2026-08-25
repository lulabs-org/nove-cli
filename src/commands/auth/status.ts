
import { getAuthStatus } from '../../utils/auth.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class AuthStatus extends NoveCommand {
  static description = 'Show authentication status without exposing credentials';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AuthStatus);
    try {
      const status = getAuthStatus(this.config.configDir);
      outputResult(this, status, {
        json: flags.json,
        successMessage: status.authenticated ? 'Authenticated.' : 'Not authenticated.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
