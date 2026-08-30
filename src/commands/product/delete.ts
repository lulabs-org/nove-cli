import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class ProductDelete extends NoveCommand {
  static args = { id: Args.string({ description: 'Product ID', required: true }) };
  static description = 'Delete a product';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProductDelete);
    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'product' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete product ${args.id}? It will no longer appear in normal queries.`,
        flags.yes,
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'product' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(`/admin/products/${args.id}`, { method: 'DELETE' }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Product deleted successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
