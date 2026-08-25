import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export interface TestServer {
  close: () => Promise<void>;
  url: string;
}

export function listen(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
): Promise<TestServer> {
  const server = createServer(handler);

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Test server did not bind.');

      resolve({
        close: () => new Promise<void>((done, reject) => {
          server.close((error) => (error ? reject(error) : done()));
        }),
        url: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

export function readRequest(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk: string) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}
