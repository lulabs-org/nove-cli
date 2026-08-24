import { expect } from 'chai';

import { type CliResult, runCli } from './cli.js';
import { listen } from './http-server.js';

export const TEST_API_KEY = 'matrix-test-key';

interface ApiKeyLoginOptions {
  apiKey?: string;
  explicitMethod?: boolean;
  source?: 'environment' | 'stdin';
  validationStatus?: number;
}

export async function runApiKeyLogin(
  environment: NodeJS.ProcessEnv,
  options: ApiKeyLoginOptions = {},
): Promise<CliResult> {
  const apiKey = options.apiKey ?? TEST_API_KEY;
  const source = options.source ?? 'environment';
  const validationStatus = options.validationStatus ?? 200;
  const server = await listen((request, response) => {
    expect(request.url).to.equal('/api/auth/api-key/validate');
    expect(request.headers['x-api-key']).to.equal(apiKey);
    response.statusCode = validationStatus;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(
      validationStatus === 200
        ? { authenticated: true }
        : { message: 'Invalid API key' },
    ));
  });

  try {
    return await runCli(
      [
        'login',
        ...(options.explicitMethod ? ['--method', 'api-key'] : []),
        ...(source === 'stdin' ? ['--api-key-stdin'] : []),
        '--json',
      ],
      {
        ...environment,
        ...(source === 'environment' ? { NOVE_API_KEY: apiKey } : {}),
        NOVE_API_URL: server.url,
      },
      source === 'stdin' ? `${apiKey}\n` : '',
    );
  } finally {
    await server.close();
  }
}

export async function loginWithApiKey(testHome: string): Promise<void> {
  const result = await runApiKeyLogin({ HOME: testHome });
  expect(result.code).to.equal(0);
}
