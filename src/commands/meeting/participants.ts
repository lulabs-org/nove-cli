import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';

export default class MeetingParticipants extends NoveCommand {
  static args = { id: Args.string({ description: 'Meeting ID', required: true }) };
  static description = 'Get participants for a meeting';
  static flags = {
    all: allFlag,
    fields: fieldsFlag,
    json: jsonFlag,
    limit: Flags.integer({ default: 50, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    search: Flags.string({ aliases: ['keyword'], description: 'Search name, email, phone, or platform user ID' }),
    sort: sortFlag,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingParticipants);
    try {
      validateListFlags(flags);
      const fetchPage = (page: number) => {
        const query = new URLSearchParams({ limit: String(flags.limit), page: String(page) });
        if (flags.search) query.set('search', flags.search);
        return fetchApi<Record<string, unknown>>(
          `/meetings/${args.id}/participants?${query}`, {}, this.config.configDir,
        );
      };

      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: ['id', 'platformUser.displayName', 'user.email', 'firstJoinTime', 'totalDurationSeconds'],
        fields: flags.fields,
        json: flags.json,
        noun: 'participants',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
