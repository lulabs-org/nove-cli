import { getApiKey } from './auth.js';

const BASE_URL = process.env.NOVE_API_URL || 'http://localhost:3000';
type FetchOptions = NonNullable<Parameters<typeof globalThis.fetch>[1]>;

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
  configDir: string
): Promise<T> {
  const apiKey = getApiKey(configDir);
  if (!apiKey) {
    throw new Error('API Key is missing. Please run `nove login` first.');
  }

  const headers = new globalThis.Headers(options.headers);
  headers.set('x-api-key', apiKey);
  if (!headers.has('Content-Type') && options.method !== 'GET' && options.method !== 'DELETE') {
    if (options.body instanceof globalThis.FormData) {
      // let fetch handle Content-Type and boundary automatically
    } else {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await globalThis.fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = await (isJson ? response.json() : response.text());

  if (!response.ok) {
    throw new Error(
      `API Error (${response.status}): ${typeof data === 'object' ? JSON.stringify(data) : data}`
    );
  }

  return data;
}
