import { getApiKey } from './auth.js';
import { getConfig } from './config.js';

type FetchOptions = NonNullable<Parameters<typeof globalThis.fetch>[1]>;

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 30_000;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

export interface ApiErrorOptions {
  cause?: unknown;
  code: string;
  details?: unknown;
  requestId?: string;
  status?: number;
}

export interface FetchApiOptions extends FetchOptions {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

interface RequestAttemptControl {
  signal: AbortSignal;
  timeout: ReturnType<typeof setTimeout>;
  timeoutController: AbortController;
}

interface RequestContext {
  fetchOptions: FetchOptions;
  headers: Headers;
  maxRetries: number;
  method: string;
  retryDelayMs: number;
  timeoutMs: number;
  url: URL;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly requestId?: string;
  public readonly status?: number;

  public constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.status = options.status;
  }

  public toJSON(): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries({
        code: this.code,
        details: this.details,
        message: this.message,
        requestId: this.requestId,
        status: this.status,
      }).filter(([, value]) => value !== undefined)
    );
  }
}

function apiErrorCode(status: number): string {
  if (status === 401) return 'API_AUTHENTICATION_ERROR';
  if (status === 403) return 'API_PERMISSION_ERROR';
  if (status === 429) return 'API_RATE_LIMITED';
  if (status >= 500) return 'API_SERVER_ERROR';
  return 'API_REQUEST_ERROR';
}

function apiErrorMessage(status: number, data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: unknown };
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }

  if (typeof data === 'string' && data.trim()) return data.trim();
  return `Nove API request failed with status ${status}.`;
}

function createRequestUrl(baseUrl: string, endpoint: string): URL {
  try {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return new URL(endpoint.replace(/^\/+/, ''), normalizedBaseUrl);
  } catch (error: unknown) {
    throw new ApiError(`Invalid Nove API URL: ${baseUrl}`, {
      cause: error,
      code: 'INVALID_API_URL',
    });
  }
}

function getRequestId(response: Response): string | undefined {
  return response.headers.get('x-request-id') ?? response.headers.get('x-correlation-id') ?? undefined;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!isJson) return text;

  try {
    return JSON.parse(text);
  } catch (error: unknown) {
    throw new ApiError('Nove API returned invalid JSON.', {
      cause: error,
      code: 'INVALID_API_RESPONSE',
      details: text,
      requestId: getRequestId(response),
      status: response.status,
    });
  }
}

function retryDelay(response: Response | undefined, attempt: number, baseDelayMs: number): number {
  const retryAfter = response?.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(MAX_RETRY_DELAY_MS, Math.max(0, seconds * 1000));

    const retryDate = Date.parse(retryAfter);
    if (Number.isFinite(retryDate)) {
      return Math.min(MAX_RETRY_DELAY_MS, Math.max(0, retryDate - Date.now()));
    }
  }

  return Math.min(MAX_RETRY_DELAY_MS, baseDelayMs * 2 ** attempt);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function createFetchOptions(options: FetchApiOptions): FetchOptions {
  const fetchOptions = { ...options };
  delete fetchOptions.retries;
  delete fetchOptions.retryDelayMs;
  delete fetchOptions.timeoutMs;
  return fetchOptions;
}

function createHeaders(apiKey: string, method: string, fetchOptions: FetchOptions): Headers {
  const headers = new globalThis.Headers(fetchOptions.headers);
  headers.set('x-api-key', apiKey);
  if (
    !headers.has('Content-Type') &&
    method !== 'GET' &&
    method !== 'DELETE' &&
    !(fetchOptions.body instanceof globalThis.FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function createAttemptControl(externalSignal: AbortSignal | null | undefined, timeoutMs: number): RequestAttemptControl {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
  const signal = externalSignal
    ? AbortSignal.any([externalSignal, timeoutController.signal])
    : timeoutController.signal;
  return { signal, timeout, timeoutController };
}

function createRequestContext(
  endpoint: string,
  options: FetchApiOptions,
  configDir: string
): RequestContext {
  const apiKey = getApiKey(configDir);
  if (!apiKey) {
    throw new ApiError('API Key is missing. Please run `nove login` first.', {
      code: 'AUTHENTICATION_REQUIRED',
    });
  }

  const config = getConfig(configDir);
  const baseUrl = process.env.NOVE_BASE_URL || config.baseUrl || 'https://noveapi.proflu.cn';
  const method = (options.method ?? 'GET').toUpperCase();
  const fetchOptions = createFetchOptions(options);
  const canRetry = method === 'GET' || method === 'HEAD';
  return {
    fetchOptions,
    headers: createHeaders(apiKey, method, fetchOptions),
    maxRetries: canRetry ? (options.retries ?? DEFAULT_RETRIES) : 0,
    method,
    retryDelayMs: options.retryDelayMs ?? 250,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    url: createRequestUrl(baseUrl, endpoint),
  };
}

function createResponseError(response: Response, data: unknown): ApiError {
  return new ApiError(apiErrorMessage(response.status, data), {
    code: apiErrorCode(response.status),
    details: data,
    requestId: getRequestId(response),
    status: response.status,
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await parseResponse(response);
  if (!response.ok) throw createResponseError(response, data);
  return data as T;
}

function shouldRetry(context: RequestContext, attempt: number, response?: Response): boolean {
  if (attempt >= context.maxRetries || context.fetchOptions.signal?.aborted) return false;
  return response === undefined || RETRYABLE_STATUSES.has(response.status);
}

async function retryRequest<T>(
  context: RequestContext,
  attempt: number,
  response?: Response
): Promise<T> {
  await response?.body?.cancel();
  await wait(retryDelay(response, attempt, context.retryDelayMs));
  return performRequestAttempt<T>(context, attempt + 1);
}

function terminalRequestError(
  context: RequestContext,
  control: RequestAttemptControl,
  error: unknown
): ApiError {
  if (context.fetchOptions.signal?.aborted) {
    return new ApiError('Nove API request was aborted.', {
      cause: error,
      code: 'API_ABORTED',
    });
  }

  const timedOut = control.timeoutController.signal.aborted;
  if (timedOut || isAbortError(error)) {
    return new ApiError(`Nove API request timed out after ${context.timeoutMs}ms.`, {
      cause: error,
      code: 'API_TIMEOUT',
    });
  }

  return new ApiError('Unable to reach the Nove API.', {
    cause: error,
    code: 'API_NETWORK_ERROR',
  });
}

function handleRequestFailure<T>(
  context: RequestContext,
  control: RequestAttemptControl,
  attempt: number,
  error: unknown
): Promise<T> {
  if (error instanceof ApiError) throw error;
  if (shouldRetry(context, attempt)) return retryRequest<T>(context, attempt);
  throw terminalRequestError(context, control, error);
}

async function performRequestAttempt<T>(context: RequestContext, attempt: number): Promise<T> {
  const control = createAttemptControl(context.fetchOptions.signal, context.timeoutMs);
  let response: Response | undefined;

  try {
    response = await globalThis.fetch(context.url, {
      ...context.fetchOptions,
      headers: context.headers,
      method: context.method,
      signal: control.signal,
    });
    if (shouldRetry(context, attempt, response)) return retryRequest<T>(context, attempt, response);
    return handleResponse<T>(response);
  } catch (error: unknown) {
    return handleRequestFailure<T>(context, control, attempt, error);
  } finally {
    clearTimeout(control.timeout);
  }
}

export function fetchApi<T = unknown>(
  endpoint: string,
  options: FetchApiOptions = {},
  configDir: string
): Promise<T> {
  return performRequestAttempt<T>(createRequestContext(endpoint, options, configDir), 0);
}
