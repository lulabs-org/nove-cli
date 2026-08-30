import { Args } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { productBody, productUpdateFlags } from '../../utils/product-input.js';

export default class ProductUpdate extends NoveCommand {
  static args = { id: Args.string({ description: 'Product ID', required: true }) };
  static description = 'Update a product';
  static flags = { ...productUpdateFlags, json: jsonFlag };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProductUpdate);
    try {
      const body = productBody(flags);
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');
      const data = await fetchApi(`/admin/products/${args.id}`, {
        body: JSON.stringify(body),
        method: 'PUT',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Product updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
