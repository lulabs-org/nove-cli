import type { IncomingMessage } from 'node:http';

import { expect } from 'chai';

import { TEST_API_KEY } from './authentication.js';
import { runCli } from './cli.js';
import { listen, readRequest } from './http-server.js';

export interface RequestSnapshot {
  body: string;
  headers: IncomingMessage['headers'];
  method: string;
  url: URL;
}

export interface SuccessCase {
  args: string[];
  assertRequest: (request: RequestSnapshot) => void;
  name: string;
  response?: unknown;
  status?: number;
}

function jsonBody(request: RequestSnapshot): Record<string, unknown> {
  return JSON.parse(request.body) as Record<string, unknown>;
}

export function expectRequest(
  method: string,
  pathname: string,
  body?: Record<string, unknown>,
) {
  return (request: RequestSnapshot): void => {
    expect(request.method).to.equal(method);
    expect(request.url.pathname).to.equal(pathname);
    expect(request.headers['x-api-key']).to.equal(TEST_API_KEY);
    if (body) expect(jsonBody(request)).to.deep.equal(body);
  };
}

export async function runSuccessCase(testHome: string, testCase: SuccessCase): Promise<void> {
  let assertionError: unknown;
  const server = await listen(async (incoming, response) => {
    const body = await readRequest(incoming);

    try {
      testCase.assertRequest({
        body,
        headers: incoming.headers,
        method: incoming.method ?? 'GET',
        url: new URL(incoming.url ?? '/', 'http://localhost'),
      });
    } catch (error: unknown) {
      assertionError = error;
    }

    response.statusCode = testCase.status ?? 200;
    if (response.statusCode === 204) {
      response.end();
      return;
    }

    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(testCase.response ?? { id: 'result-1' }));
  });

  try {
    const result = await runCli([...testCase.args, '--json'], {
      HOME: testHome,
      NOVE_API_URL: server.url,
    });
    if (assertionError) throw assertionError;
    expect(result.code, testCase.name).to.equal(0);
    expect(result.stderr, testCase.name).to.equal('');
    expect(() => JSON.parse(result.stdout), testCase.name).not.to.throw();
  } finally {
    await server.close();
  }
}
