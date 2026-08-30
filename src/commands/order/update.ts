import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { orderBody, orderUpdateFlags } from '../../utils/order-input.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class OrderUpdate extends NoveCommand {
  static args = { id: Args.string({ description: 'Order ID', required: true }) };
  static description = 'Update an order';
  static flags = { ...orderUpdateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(OrderUpdate);
    try {
      const body = orderBody(flags);
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');
      const data = await fetchApi(`/admin/orders/${args.id}`, {
        body: JSON.stringify(body),
        method: 'PUT',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Order updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
