import { Command, Args } from '@oclif/core';
import { setConfig } from '../../utils/config.js';

export default class ConfigSet extends Command {
  static description = 'Set a configuration value';

  static args = {
    key: Args.string({ description: 'Configuration key (e.g., api-url)', required: true }),
    value: Args.string({ description: 'Configuration value', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(ConfigSet);
    const { configDir } = this.config;

    if (args.key === 'api-url') {
      setConfig(configDir, { apiUrl: args.value });
      this.log(`✅ API URL successfully set to ${args.value}`);
    } else {
      this.error(`Unknown configuration key: ${args.key}`);
    }
  }
}
