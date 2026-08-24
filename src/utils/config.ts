import * as fs from 'node:fs';
import path from 'node:path';

import { validateHttpUrl } from './validation.js';

export interface CliConfig {
  baseUrl?: string;
}

function configFile(configDir: string): string {
  return path.join(configDir, 'config.json');
}

function validateConfig(data: unknown, file: string): CliConfig {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Configuration file has an invalid structure: ${file}.`);
  }

  const record = data as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter((key) => key !== 'baseUrl');
  if (unknownKeys.length > 0) {
    throw new Error(`Configuration file contains unsupported keys: ${unknownKeys.join(', ')}.`);
  }

  if (record.baseUrl !== undefined && typeof record.baseUrl !== 'string') {
    throw new Error(`Configuration baseUrl must be a string: ${file}.`);
  }

  if (record.baseUrl) validateHttpUrl(record.baseUrl, 'Configuration Base URL');
  return record as CliConfig;
}

export function getConfig(configDir: string): CliConfig {
  const file = configFile(configDir);
  if (!fs.existsSync(file)) return {};

  let rawData: string;
  try {
    rawData = fs.readFileSync(file, 'utf8');
  } catch {
    throw new Error(`Unable to read configuration file: ${file}.`);
  }

  try {
    return validateConfig(JSON.parse(rawData), file);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) throw new Error(`Configuration file is invalid JSON: ${file}.`);
    throw error;
  }
}

export function setConfig(configDir: string, newConfig: Partial<CliConfig>): void {
  const file = configFile(configDir);
  const updatedConfig = validateConfig({ ...getConfig(configDir), ...newConfig }, file);
  fs.mkdirSync(configDir, { mode: 0o700, recursive: true });
  fs.writeFileSync(file, JSON.stringify(updatedConfig, null, 2), { encoding: 'utf8', mode: 0o600 });
}
