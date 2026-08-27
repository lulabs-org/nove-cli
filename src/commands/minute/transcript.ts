import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class MinuteTranscript extends NoveCommand {
  static args = {
    minuteId: Args.string({ description: 'Minute ID', required: true }),
  };
  static description = 'Get transcript for a meeting minute';
  static flags = {
    'include-local-user': Flags.boolean({
      aliases: ['includeLocalUser'],
      description: 'Include linked local user details in transcript segments',
    }),
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteTranscript);

    try {
      const path = `/minutes/${args.minuteId}/transcript${
        flags['include-local-user'] ? '?includeLocalUser=true' : ''
      }`;
      const data = await fetchApi(path, {}, this.config.configDir);
      outputResult(this, data, { json: flags.json });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
