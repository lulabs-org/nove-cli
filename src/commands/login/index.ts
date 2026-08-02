import { password } from '@inquirer/prompts';
import { Command, Flags } from '@oclif/core';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default class Login extends Command {
  static description = 'Login to Nove API using an API Key';
static flags = {
    'api-key': Flags.string({
      char: 'k',
      description: 'The API Key to use for authentication (e.g. sk_...)',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    let apiKey = flags['api-key'];

    if (!apiKey) {
      apiKey = await password({ mask: '*', message: 'Enter your API Key:' });
    }

    if (!apiKey) {
      this.error('API Key is required to login.');
    }

    // Save the API key to the config directory
    const {configDir} = this.config;
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configFile = path.join(configDir, 'auth.json');
    const authData = {
      apiKey,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(configFile, JSON.stringify(authData, null, 2), 'utf8');

    this.log(`✅ API Key successfully saved to ${configFile}`);
    this.log('You are now authenticated for future nove-cli commands.');
  }
}
