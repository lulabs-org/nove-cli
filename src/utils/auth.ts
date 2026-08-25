import * as fs from 'node:fs';
import path from 'node:path';

interface ApiKeyAuthData {
  apiKey: string;
  method: 'api_key';
  updatedAt: string;
  version: 2;
}

export interface OAuthAuthData {
  accessToken: string;
  accessTokenExpiresAt: string;
  clientId: string;
  method: 'oauth';
  organizationId: string;
  refreshToken: string;
  scopes: string[];
  updatedAt: string;
  version: 2;
}

export type StoredAuth = ApiKeyAuthData | OAuthAuthData;

export interface AuthStatus {
  accessTokenExpiresAt?: string;
  authenticated: boolean;
  method?: 'api_key' | 'oauth';
  organizationId?: string;
  scopes?: string[];
  updatedAt?: string;
}

function authFile(configDir: string): string {
  return path.join(configDir, 'auth.json');
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isLegacyApiKeyAuth(candidate: Record<string, unknown>): boolean {
  return candidate.method === undefined && typeof candidate.apiKey === 'string' &&
    Boolean(candidate.apiKey.trim()) && validDate(candidate.updatedAt);
}

function isApiKeyAuth(candidate: Record<string, unknown>): boolean {
  return candidate.version === 2 && candidate.method === 'api_key' &&
    typeof candidate.apiKey === 'string' && Boolean(candidate.apiKey.trim()) &&
    validDate(candidate.updatedAt);
}

function isOAuthAuth(candidate: Record<string, unknown>): boolean {
  return candidate.version === 2 && candidate.method === 'oauth' &&
    typeof candidate.accessToken === 'string' && Boolean(candidate.accessToken.trim()) &&
    validDate(candidate.accessTokenExpiresAt) &&
    typeof candidate.refreshToken === 'string' && Boolean(candidate.refreshToken.trim()) &&
    Array.isArray(candidate.scopes) && candidate.scopes.every((scope) => typeof scope === 'string') &&
    typeof candidate.organizationId === 'string' && typeof candidate.clientId === 'string' &&
    validDate(candidate.updatedAt);
}

function parseAuthData(rawData: string, configFile: string): StoredAuth {
  let data: unknown;
  try {
    data = JSON.parse(rawData);
  } catch {
    throw new Error(`Authentication file is invalid JSON: ${configFile}. Run \`nove login\` to repair it.`);
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Authentication file has an invalid structure: ${configFile}. Run \`nove login\` to repair it.`);
  }

  const candidate = data as Record<string, unknown>;
  if (isLegacyApiKeyAuth(candidate)) {
    return {
      apiKey: candidate.apiKey as string,
      method: 'api_key',
      updatedAt: candidate.updatedAt as string,
      version: 2,
    };
  }

  if (isApiKeyAuth(candidate)) return candidate as unknown as ApiKeyAuthData;
  if (isOAuthAuth(candidate)) return candidate as unknown as OAuthAuthData;

  throw new Error(`Authentication file has an invalid structure: ${configFile}. Run \`nove login\` to repair it.`);
}

export function getStoredAuth(configDir: string): null | StoredAuth {
  const configFile = authFile(configDir);
  if (!fs.existsSync(configFile)) return null;
  try {
    return parseAuthData(fs.readFileSync(configFile, 'utf8'), configFile);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Authentication file')) throw error;
    throw new Error(`Unable to read authentication file: ${configFile}.`);
  }
}

export function getApiKey(configDir: string): null | string {
  const auth = getStoredAuth(configDir);
  return auth?.method === 'api_key' ? auth.apiKey : null;
}

export function getOAuthAuth(configDir: string): null | OAuthAuthData {
  const auth = getStoredAuth(configDir);
  return auth?.method === 'oauth' ? auth : null;
}

export function getAuthStatus(configDir: string): AuthStatus {
  const auth = getStoredAuth(configDir);
  if (!auth) return { authenticated: false };
  if (auth.method === 'api_key') {
    return { authenticated: true, method: auth.method, updatedAt: auth.updatedAt };
  }

  return {
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
    authenticated: true,
    method: auth.method,
    organizationId: auth.organizationId,
    scopes: [...auth.scopes],
    updatedAt: auth.updatedAt,
  };
}

function writeAuth(configDir: string, auth: StoredAuth): void {
  fs.mkdirSync(configDir, { mode: 0o700, recursive: true });
  const configFile = authFile(configDir);
  fs.writeFileSync(configFile, JSON.stringify(auth, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.chmodSync(configFile, 0o600);
}

export function saveApiKey(configDir: string, apiKey: string): AuthStatus {
  const updatedAt = new Date().toISOString();
  writeAuth(configDir, { apiKey, method: 'api_key', updatedAt, version: 2 });
  return { authenticated: true, method: 'api_key', updatedAt };
}

export function saveOAuthAuth(
  configDir: string,
  auth: Omit<OAuthAuthData, 'method' | 'updatedAt' | 'version'>
): AuthStatus {
  const updatedAt = new Date().toISOString();
  writeAuth(configDir, { method: 'oauth', version: 2, ...auth, updatedAt });
  return getAuthStatus(configDir);
}

export function removeCredential(configDir: string): boolean {
  const configFile = authFile(configDir);
  if (!fs.existsSync(configFile)) return false;
  fs.rmSync(configFile);
  return true;
}

export const removeApiKey = removeCredential;
