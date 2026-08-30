import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { PRODUCT_STATUSES } from '../../utils/validation.js';

export default class ProductStatus extends NoveCommand {
  static args = { id: Args.string({ description: 'Product ID', required: true }) };
  static description = 'Update a product status';
  static flags = {
    json: jsonFlag,
    status: Flags.string({ description: 'Product status', options: [...PRODUCT_STATUSES], required: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProductStatus);
    try {
      const data = await fetchApi(`/admin/products/${args.id}/status`, {
        body: JSON.stringify({ status: flags.status }),
        method: 'PATCH',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Product status updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
