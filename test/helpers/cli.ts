import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface CliResult {
  code: null | number;
  stderr: string;
  stdout: string;
}

export function runCli(
  args: string[],
  environment: NodeJS.ProcessEnv,
  input = '',
): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['bin/run.js', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, ...environment, NO_COLOR: '1', NODE_ENV: 'production' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stderr = '';
    let stdout = '';

    child.stderr.setEncoding('utf8');
    child.stdout.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stderr, stdout }));
    child.stdin.end(input);
  });
}

export function createTestHome(prefix = 'nove-cli-test-'): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

export function removeTestHome(testHome: string): void {
  try {
    rmSync(testHome, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
  } catch {
    // Ignore transient cleanup errors
  }
}
