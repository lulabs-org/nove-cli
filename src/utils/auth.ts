import * as fs from 'node:fs';
import * as path from 'node:path';

export function getApiKey(configDir: string): string | null {
  const configFile = path.join(configDir, 'auth.json');
  if (!fs.existsSync(configFile)) {
    return null;
  }
  
  try {
    const rawData = fs.readFileSync(configFile, 'utf8');
    const data = JSON.parse(rawData);
    return data.apiKey || null;
  } catch (error) {
    return null;
  }
}
