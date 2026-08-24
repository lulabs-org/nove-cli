import { Args, Command, Flags } from '@oclif/core';

import { fetchApi } from '../../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag } from '../../../utils/list-output.js';
import { handleCommandError, jsonFlag } from '../../../utils/output.js';

export default class MinuteSpeakerSummaryList extends Command {
  static args = { minuteId: Args.string({ description: 'Minute ID', required: true }) };
  static description = 'List speaker summaries for a meeting minute';
  static flags = {
    all: allFlag,
    fields: fieldsFlag,
    json: jsonFlag,
    limit: Flags.integer({ default: 20, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    sort: sortFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MinuteSpeakerSummaryList);
    try {
      const fetchPage = (page: number) => fetchApi<Record<string, unknown>>(
        `/minutes/${args.minuteId}/speaker-summaries?${new URLSearchParams({ limit: String(flags.limit), page: String(page) })}`,
        {}, this.config.configDir,
      );
      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: ['id', 'platformUserId', 'generatedBy', 'aiModel', 'updatedAt'],
        fields: flags.fields,
        json: flags.json,
        noun: 'speaker summaries',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
