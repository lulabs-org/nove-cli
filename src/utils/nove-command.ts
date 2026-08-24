import { Command, Errors } from '@oclif/core';

import { ApiError } from './api.js';

function requestedJson(argv: string[]): boolean {
  const separator = argv.indexOf('--');
  const json = argv.indexOf('--json');
  return json !== -1 && (separator === -1 || json < separator);
}

function exitCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 1;
  const candidate = error as {
    exitCode?: unknown;
    oclif?: { exit?: unknown };
  };
  if (typeof candidate.oclif?.exit === 'number') return candidate.oclif.exit;
  if (typeof candidate.exitCode === 'number') return candidate.exitCode;
  return 1;
}

function commandError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : String(error), {
    code: error instanceof Errors.CLIError ? 'CLI_USAGE_ERROR' : 'CLI_ERROR',
  });
}

export abstract class NoveCommand extends Command {
  public async catch(error: unknown): Promise<void> {
    if (error instanceof Errors.ExitError || !requestedJson(this.argv)) {
      return super.catch(error as Error);
    }

    process.exitCode = exitCode(error);
    this.logToStderr(JSON.stringify(commandError(error).toJSON()));
  }
}
