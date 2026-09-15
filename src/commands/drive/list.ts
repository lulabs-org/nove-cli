import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

interface NodesResponse {
  items: unknown[];
  nextCursor: null | string;
}

async function collectAllPages(
  fetchPage: (cursor?: string) => Promise<NodesResponse>,
  allItems: unknown[],
  cursor?: string
): Promise<void> {
  const pageRes = await fetchPage(cursor);
  allItems.push(...pageRes.items);
  if (pageRes.nextCursor) {
    return collectAllPages(fetchPage, allItems, pageRes.nextCursor);
  }
}

export default class DriveList extends NoveCommand {
  static description = 'List files and folders in a cloud drive space';
  static flags = {
    all: allFlag,
    cursor: Flags.string({ description: 'Pagination cursor for next page', exclusive: ['all'] }),
    fields: fieldsFlag,
    json: jsonFlag,
    limit: Flags.integer({ default: 50, description: 'Items per page', max: 100, min: 1 }),
    'parent-id': Flags.string({ aliases: ['parentId'], description: 'Parent folder ID' }),
    sort: sortFlag,
    'space-id': Flags.string({ aliases: ['spaceId'], description: 'Drive space ID', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(DriveList);
    try {
      validateListFlags(flags);

      const fetchPage = async (cursor?: string): Promise<NodesResponse> => {
        const query = new URLSearchParams({ limit: String(flags.limit) });
        if (flags['parent-id']) query.set('parentId', flags['parent-id']);
        if (cursor) query.set('cursor', cursor);
        return fetchApi<NodesResponse>(
          `/drive/spaces/${flags['space-id']}/nodes?${query}`,
          {},
          this.config.configDir
        );
      };

      if (flags.all) {
        const allItems: unknown[] = [];
        await collectAllPages(fetchPage, allItems);

        if (flags.json) {
          outputResult(this, { items: allItems, nextCursor: null }, { json: true });
          return;
        }

        outputList(
          this,
          { items: allItems, total: allItems.length },
          {
            defaultFields: ['id', 'name', 'type', 'sizeBytes', 'fileStatus', 'updatedAt'],
            fields: flags.fields,
            noun: 'drive items',
            sort: flags.sort,
          }
        );
        return;
      }

      const response = await fetchPage(flags.cursor);
      if (flags.json) {
        outputResult(this, response, { json: true });
        return;
      }

      outputList(
        this,
        { items: response.items, total: response.items.length },
        {
          defaultFields: ['id', 'name', 'type', 'sizeBytes', 'fileStatus', 'updatedAt'],
          fields: flags.fields,
          noun: 'drive items',
          sort: flags.sort,
        }
      );
      if (response.nextCursor) {
        this.log(`\nNext page cursor: ${response.nextCursor}`);
      }
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
