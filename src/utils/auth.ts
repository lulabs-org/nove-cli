import * as fs from 'node:fs';
import path from 'node:path';

interface AuthData {
  apiKey: string;
  updatedAt: string;
}

export interface AuthStatus {
  authenticated: boolean;
  updatedAt?: string;
}

function authFile(configDir: string): string {
  return path.join(configDir, 'auth.json');
}

function parseAuthData(rawData: string, configFile: string): AuthData {
  let data: unknown;
  try {
    data = JSON.parse(rawData);
  } catch {
    throw new Error(`Authentication file is invalid JSON: ${configFile}. Run \`nove login\` to repair it.`);
  }

  const authData = data as null | Partial<AuthData>;
  if (
    !authData ||
    typeof authData !== 'object' ||
    typeof authData.apiKey !== 'string' ||
    !authData.apiKey.trim() ||
    typeof authData.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(authData.updatedAt))
  ) {
    throw new Error(`Authentication file has an invalid structure: ${configFile}. Run \`nove login\` to repair it.`);
  }

  return authData as AuthData;
}

function readAuthData(configDir: string): AuthData | null {
  const configFile = authFile(configDir);
  if (!fs.existsSync(configFile)) return null;

  let rawData: string;
  try {
    rawData = fs.readFileSync(configFile, 'utf8');
  } catch {
    throw new Error(`Unable to read authentication file: ${configFile}.`);
  }

  return parseAuthData(rawData, configFile);
}

export function getApiKey(configDir: string): null | string {
  return readAuthData(configDir)?.apiKey ?? null;
}

export function getAuthStatus(configDir: string): AuthStatus {
  const data = readAuthData(configDir);
  return data ? { authenticated: true, updatedAt: data.updatedAt } : { authenticated: false };
}

export function saveApiKey(configDir: string, apiKey: string): AuthStatus {
  fs.mkdirSync(configDir, { mode: 0o700, recursive: true });
  const configFile = authFile(configDir);
  const data: AuthData = { apiKey, updatedAt: new Date().toISOString() };
  fs.writeFileSync(configFile, JSON.stringify(data, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.chmodSync(configFile, 0o600);

  return { authenticated: true, updatedAt: data.updatedAt };
}

export function removeApiKey(configDir: string): boolean {
  const configFile = authFile(configDir);
  if (!fs.existsSync(configFile)) return false;
  fs.rmSync(configFile);
  return true;
}
