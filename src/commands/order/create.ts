import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { orderBody, orderCreateFlags } from '../../utils/order-input.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

export default class OrderCreate extends NoveCommand {
  static description = 'Create an order';
  static flags = { ...orderCreateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(OrderCreate);
    try {
      const data = await fetchApi('/admin/orders', {
        body: JSON.stringify(orderBody(flags)),
        method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Order created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
