import { Args } from '@oclif/core';

import { setConfig } from '../../utils/config.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { validateHttpUrl } from '../../utils/validation.js';

export default class ConfigSet extends NoveCommand {
  static args = {
    key: Args.string({ description: 'Configuration key (e.g., base-url)', required: true }),
    value: Args.string({ description: 'Configuration value', required: true }),
  };
static description = 'Set a configuration value';
  static flags = { json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigSet);
    const { configDir } = this.config;

    if (args.key === 'base-url') {
      try {
        const baseUrl = validateHttpUrl(args.value, 'Base URL');
        setConfig(configDir, { baseUrl });
        outputResult(this, { baseUrl }, {
          json: flags.json,
          successMessage: `Base URL successfully set to ${baseUrl}`,
        });
      } catch (error: unknown) {
        handleCommandError(this, error, flags.json);
      }
    } else {
      handleCommandError(this, new Error(`Unknown configuration key: ${args.key}`), flags.json);
    }
  }
}
