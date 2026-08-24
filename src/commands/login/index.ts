import { password } from '@inquirer/prompts';
import { Flags } from '@oclif/core';

import { verifyApiKey } from '../../utils/api.js';
import { saveApiKey } from '../../utils/auth.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

function readApiKeyFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => {
      input += chunk;
    });
    process.stdin.on('end', () => resolve(input.trim()));
    process.stdin.on('error', reject);
  });
}

function suppliedSourceCount(stdin: boolean): number {
  return [Boolean(process.env.NOVE_API_KEY?.trim()), stdin].filter(Boolean).length;
}

export default class Login extends NoveCommand {
  static description = 'Validate and securely store a Nove API Key';
  static flags = {
    'api-key-stdin': Flags.boolean({
      description: 'Read the API Key from stdin',
    }),
    json: jsonFlag,
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Login);
    try {
      if (suppliedSourceCount(flags['api-key-stdin']) > 1) {
        throw new Error('Choose only one API Key source: stdin or NOVE_API_KEY.');
      }

      let apiKey = process.env.NOVE_API_KEY?.trim();
      if (flags['api-key-stdin']) apiKey = await readApiKeyFromStdin();
      if (!apiKey && !process.stdin.isTTY) {
        throw new Error('No API Key supplied. Pipe it with --api-key-stdin or set NOVE_API_KEY.');
      }

      apiKey ||= await password({ mask: '*', message: 'Enter your API Key:' });
      if (!apiKey.trim()) throw new Error('API Key is required to login.');

      await verifyApiKey(apiKey.trim(), this.config.configDir);
      const status = saveApiKey(this.config.configDir, apiKey.trim());
      outputResult(this, status, {
        json: flags.json,
        successMessage: 'API Key saved securely. You are now authenticated.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
