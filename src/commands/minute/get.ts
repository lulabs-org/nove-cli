import { Args, Command } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MinuteGet extends Command {
  static args = {
    id: Args.string({ description: 'Minute ID', required: true }),
  };
static description = 'Get details of a meeting minute';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteGet);

    try {
      const data = await fetchApi(`/minutes/${args.id}`, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
