import * as fs from 'node:fs';
import path from 'node:path';

export interface CliConfig {
  apiUrl?: string;
}

export function getConfig(configDir: string): CliConfig {
  const configFile = path.join(configDir, 'config.json');
  if (!fs.existsSync(configFile)) {
    return {};
  }
  
  try {
    const rawData = fs.readFileSync(configFile, 'utf8');
    return JSON.parse(rawData);
  } catch {
    return {};
  }
}

export function setConfig(configDir: string, newConfig: Partial<CliConfig>): void {
  const configFile = path.join(configDir, 'config.json');
  const existingConfig = getConfig(configDir);
  const updatedConfig = { ...existingConfig, ...newConfig };
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configFile, JSON.stringify(updatedConfig, null, 2), 'utf8');
}
