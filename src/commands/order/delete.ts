import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { confirmDestructiveAction, destructiveFlags } from '../../utils/destructive-action.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class OrderDelete extends NoveCommand {
  static args = { id: Args.string({ description: 'Order ID', required: true }) };
  static description = 'Delete an order';
  static flags = { ...destructiveFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(OrderDelete);
    try {
      if (flags['dry-run']) {
        outputResult(this, { dryRun: true, id: args.id, resource: 'order' }, { json: flags.json });
        return;
      }

      const confirmed = await confirmDestructiveAction(
        `Delete order ${args.id}? It will no longer appear in normal queries.`,
        flags.yes,
      );
      if (!confirmed) {
        outputResult(this, { cancelled: true, id: args.id, resource: 'order' }, { json: flags.json });
        return;
      }

      const data = await fetchApi(`/admin/orders/${args.id}`, { method: 'DELETE' }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Order deleted successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
