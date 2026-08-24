import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag } from '../../utils/list-output.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { RECORDING_SOURCES, RECORDING_STATUSES } from '../../utils/validation.js';

export default class MinuteList extends Command {
  static description = 'List meeting minutes';
  static flags = {
    all: allFlag,
    fields: fieldsFlag,
    json: jsonFlag,
    limit: Flags.integer({ default: 10, description: 'Items per page', max: 100, min: 1 }),
    'meeting-id': Flags.string({ aliases: ['meetingId'], description: 'Filter by Meeting ID' }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    sort: sortFlag,
    source: Flags.string({ description: 'Minute source', options: [...RECORDING_SOURCES] }),
    status: Flags.string({ description: 'Minute status', options: [...RECORDING_STATUSES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MinuteList);
    try {
      const fetchPage = (page: number) => {
        const query = new URLSearchParams({ limit: String(flags.limit), page: String(page) });
        if (flags['meeting-id']) query.set('meetingId', flags['meeting-id']);
        if (flags.source) query.set('source', flags.source);
        if (flags.status) query.set('status', flags.status);
        return fetchApi<Record<string, unknown>>(`/minutes?${query}`, {}, this.config.configDir);
      };

      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: ['id', 'meetingId', 'source', 'status', 'startAt', 'createdAt'],
        fields: flags.fields,
        json: flags.json,
        noun: 'minutes',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
