import { password, select } from '@inquirer/prompts';
import { Flags } from '@oclif/core';

import { verifyApiKey } from '../../utils/api.js';
import { saveApiKey } from '../../utils/auth.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { loginWithBrowser } from '../../utils/oauth.js';
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

type LoginMethod = 'api-key' | 'oauth';

function isInteractiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function selectLoginMethod(): Promise<LoginMethod> {
  return select<LoginMethod>({
    choices: [
      {
        description: '在浏览器中选择授权范围，适合个人登录',
        name: '浏览器授权（推荐）',
        value: 'oauth',
      },
      {
        description: '适用于自动化和服务账号',
        name: 'API Key',
        value: 'api-key',
      },
    ],
    message: '请选择登录方式',
  });
}

function hasOAuthFlags(noBrowser: boolean, scopes: string[] | undefined): boolean {
  return noBrowser || Boolean(scopes?.length);
}

interface LoginMethodOptions {
  apiKeyFromStdin: boolean;
  explicitMethod?: LoginMethod;
  json: boolean;
  noBrowser: boolean;
  scopes?: string[];
}

async function resolveLoginMethod(options: LoginMethodOptions): Promise<LoginMethod> {
  const sourceCount = suppliedSourceCount(options.apiKeyFromStdin);
  if (sourceCount > 1) {
    throw new Error('Choose only one API Key source: stdin or NOVE_API_KEY.');
  }

  const hasApiKeySource = sourceCount > 0;
  const oauthFlagsSupplied = hasOAuthFlags(options.noBrowser, options.scopes);
  if (options.explicitMethod === 'oauth' && options.apiKeyFromStdin) {
    throw new Error('--api-key-stdin cannot be used with --method oauth.');
  }

  if (options.explicitMethod === 'api-key' && oauthFlagsSupplied) {
    throw new Error('--no-browser and --scope can only be used with --method oauth.');
  }

  if (!options.explicitMethod && hasApiKeySource && oauthFlagsSupplied) {
    throw new Error('API Key sources cannot be combined with --no-browser or --scope.');
  }

  if (options.explicitMethod) return options.explicitMethod;
  if (hasApiKeySource) return 'api-key';
  if (oauthFlagsSupplied) return 'oauth';
  if (options.json || !isInteractiveTerminal()) {
    throw new Error(
      'Login method is required in a non-interactive environment. Use --method oauth or --method api-key.',
    );
  }

  return selectLoginMethod();
}

async function getApiKey(apiKeyFromStdin: boolean, json: boolean): Promise<string> {
  let apiKey = process.env.NOVE_API_KEY?.trim();
  if (apiKeyFromStdin) apiKey = await readApiKeyFromStdin();
  if (!apiKey && !apiKeyFromStdin && !json && isInteractiveTerminal()) {
    apiKey = await password({ mask: '*', message: '请输入 Nove API Key:' });
  }

  if (!apiKey?.trim()) {
    throw new Error(
      'API Key is required. Enter it interactively, set NOVE_API_KEY, or use --api-key-stdin.',
    );
  }

  return apiKey.trim();
}

export default class Login extends NoveCommand {
  static description = 'Sign in through the browser, or validate an API Key for automation';
  static flags = {
    'api-key-stdin': Flags.boolean({
      description: 'Read the API Key from stdin',
    }),
    json: jsonFlag,
    method: Flags.string({
      description: 'Choose the login method',
      options: ['oauth', 'api-key'],
    }),
    'no-browser': Flags.boolean({
      description: 'Print the authorization URL instead of opening a browser',
    }),
    scope: Flags.string({
      description: 'Limit permissions offered on the consent page (repeatable)',
      multiple: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Login);
    try {
      const apiKeyFromStdin = flags['api-key-stdin'];
      const method = await resolveLoginMethod({
        apiKeyFromStdin,
        explicitMethod: flags.method as LoginMethod | undefined,
        json: flags.json,
        noBrowser: flags['no-browser'],
        scopes: flags.scope,
      });

      if (method === 'api-key') {
        const apiKey = await getApiKey(apiKeyFromStdin, flags.json);
        await verifyApiKey(apiKey, this.config.configDir);
        const status = saveApiKey(this.config.configDir, apiKey);

        outputResult(this, status, {
          json: flags.json,
          successMessage: 'API Key saved securely. You are now authenticated.',
        });
        return;
      }

      const status = await loginWithBrowser(this.config.configDir, {
        noBrowser: flags['no-browser'],
        onAuthorizationUrl: (url, fallback) => {
          this.logToStderr(
            fallback ? `Open this URL to continue:\n${url}` : 'Browser opened. Complete authorization to continue.',
          );
        },
        scopes: flags.scope,
      });
      outputResult(this, status, {
        json: flags.json,
        successMessage: `Authenticated through the browser with ${status.scopes?.length ?? 0} permissions.`,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
