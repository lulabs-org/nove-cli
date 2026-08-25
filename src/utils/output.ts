import { Command, Flags } from '@oclif/core';

import { ApiError } from './api.js';

export const jsonFlag = Flags.boolean({
  description: 'Output a single JSON value to stdout',
});

export interface OutputOptions {
  json?: boolean;
  successMessage?: string;
}

export function outputResult(command: Command, data: unknown, options: OutputOptions = {}): void {
  if (options.json) {
    command.log(JSON.stringify(data ?? null));
    return;
  }

  if (options.successMessage) command.log(options.successMessage);
  if (data !== undefined && data !== '') command.log(JSON.stringify(data, null, 2));
}

export function handleCommandError(command: Command, error: unknown, json = false): never {
  const normalized =
    error instanceof ApiError
      ? error
      : new ApiError(error instanceof Error ? error.message : String(error), {
          code: 'CLI_ERROR',
        });

  if (json) {
    command.logToStderr(JSON.stringify(normalized.toJSON()));
    return command.exit(1);
  }

  return command.error(normalized.message, { exit: 1 });
}
