import { confirm } from '@inquirer/prompts';
import { Flags } from '@oclif/core';

export const destructiveFlags = {
  'dry-run': Flags.boolean({
    description: 'Show what would be deleted without sending the request',
  }),
  yes: Flags.boolean({
    char: 'y',
    description: 'Skip the interactive confirmation',
  }),
};

export async function confirmDestructiveAction(message: string, yes = false): Promise<boolean> {
  if (yes) return true;
  if (!process.stdin.isTTY) {
    throw new Error('Deletion requires confirmation. Re-run with --yes in a non-interactive environment.');
  }

  return confirm({ default: false, message });
}
