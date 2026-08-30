import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { ORDER_STATUSES } from '../../utils/validation.js';

export default class OrderStatus extends NoveCommand {
  static args = { id: Args.string({ description: 'Order ID', required: true }) };
  static description = 'Update an order status';
  static flags = {
    json: jsonFlag,
    status: Flags.string({ description: 'Order status', options: [...ORDER_STATUSES], required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(OrderStatus);
    try {
      const data = await fetchApi(`/admin/orders/${args.id}/status`, {
        body: JSON.stringify({ status: flags.status }),
        method: 'PATCH',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Order status updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
