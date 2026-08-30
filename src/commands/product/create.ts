import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { productBody, productCreateFlags } from '../../utils/product-input.js';

export default class ProductCreate extends NoveCommand {
  static description = 'Create a product';
  static flags = { ...productCreateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ProductCreate);
    try {
      const data = await fetchApi('/admin/products', {
        body: JSON.stringify(productBody(flags)),
        method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Product created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
