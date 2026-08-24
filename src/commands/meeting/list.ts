import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import { MEETING_PLATFORMS, MEETING_TYPES, PROCESSING_STATUSES, resolveDateRange } from '../../utils/validation.js';

export default class MeetingList extends NoveCommand {
  static description = 'List meetings';
  static flags = {
    all: allFlag,
    date: Flags.string({ description: 'Local calendar day (YYYY-MM-DD)' }),
    'end-date': Flags.string({ aliases: ['endDate'], description: 'Exclusive ISO end date with timezone' }),
    fields: fieldsFlag,
    json: jsonFlag,
    limit: Flags.integer({ default: 10, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    platform: Flags.string({ description: 'Meeting platform', options: [...MEETING_PLATFORMS] }),
    search: Flags.string({ description: 'Search keyword' }),
    sort: sortFlag,
    'start-date': Flags.string({ aliases: ['startDate'], description: 'Inclusive ISO start date with timezone' }),
    status: Flags.string({ description: 'Processing status', options: [...PROCESSING_STATUSES] }),
    timezone: Flags.string({ default: 'Asia/Shanghai', description: 'IANA timezone used with --date' }),
    type: Flags.string({ description: 'Meeting type', options: [...MEETING_TYPES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MeetingList);
    try {
      validateListFlags(flags);
      const dateRange = resolveDateRange({
        date: flags.date,
        endDate: flags['end-date'],
        startDate: flags['start-date'],
        timeZone: flags.timezone,
      });
      const fetchPage = (page: number) => this.fetchPage(page, flags.limit, flags, dateRange);
      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: ['id', 'title', 'platform', 'startAt', 'participantCount'],
        fields: flags.fields,
        json: flags.json,
        noun: 'meetings',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }

  private fetchPage(
    page: number,
    limit: number,
    flags: { platform?: string; search?: string; status?: string; type?: string },
    dateRange: { endDate?: string; startDate?: string }
  ): Promise<Record<string, unknown>> {
    const query = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (flags.platform) query.set('platform', flags.platform);
    if (flags.status) query.set('status', flags.status);
    if (flags.type) query.set('type', flags.type);
    if (flags.search) query.set('search', flags.search);
    if (dateRange.startDate) query.set('startDate', dateRange.startDate);
    if (dateRange.endDate) query.set('endDate', dateRange.endDate);
    return fetchApi(`/meetings?${query}`, {}, this.config.configDir);
  }
}
