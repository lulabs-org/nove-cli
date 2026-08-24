import { Args, Command } from '@oclif/core';

import { setConfig } from '../../utils/config.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class ConfigSet extends Command {
  static args = {
    key: Args.string({ description: 'Configuration key (e.g., api-url)', required: true }),
    value: Args.string({ description: 'Configuration value', required: true }),
  };
static description = 'Set a configuration value';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigSet);
    const { configDir } = this.config;

    if (args.key === 'api-url') {
      setConfig(configDir, { apiUrl: args.value });
      outputResult(this, { apiUrl: args.value }, {
        json: flags.json,
        successMessage: `✅ API URL successfully set to ${args.value}`,
      });
    } else {
      handleCommandError(this, new Error(`Unknown configuration key: ${args.key}`), flags.json);
    }
  }
}
