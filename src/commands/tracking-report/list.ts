import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { allFlag, fetchAllPages, fieldsFlag, outputList, sortFlag, validateListFlags } from '../../utils/list-output.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag } from '../../utils/output.js';
import {
  TRACKING_REPORT_CADENCES,
  TRACKING_REPORT_TYPES,
  TRACKING_TARGET_TYPES,
  validateDateRange,
} from '../../utils/validation.js';

interface TrackingReportListFlags {
  cadence?: string;
  keyword?: string;
  'period-end'?: string;
  'period-start'?: string;
  'target-id'?: string;
  'target-type'?: string;
  'tracking-type'?: string;
}

export default class TrackingReportList extends NoveCommand {
  static description = 'List tracking reports';
  static flags = {
    all: allFlag,
    cadence: Flags.string({ description: 'Report cadence', options: [...TRACKING_REPORT_CADENCES] }),
    fields: fieldsFlag,
    json: jsonFlag,
    keyword: Flags.string({ description: 'Search target names' }),
    limit: Flags.integer({ default: 20, description: 'Items per page', max: 100, min: 1 }),
    page: Flags.integer({ default: 1, description: 'Page number', min: 1 }),
    'period-end': Flags.string({ description: 'Exclusive ISO period end with timezone' }),
    'period-start': Flags.string({ description: 'Inclusive ISO period start with timezone' }),
    sort: sortFlag,
    'target-id': Flags.string({ description: 'Filter by business object ID' }),
    'target-type': Flags.string({ description: 'Filter by tracking target type', options: [...TRACKING_TARGET_TYPES] }),
    'tracking-type': Flags.string({ description: 'Filter by tracking report type', options: [...TRACKING_REPORT_TYPES] }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TrackingReportList);
    try {
      validateListFlags(flags);
      validateDateRange(flags['period-start'], flags['period-end']);
      const fetchPage = (page: number) => this.fetchPage(page, flags.limit, flags);
      const data = flags.all ? await fetchAllPages(fetchPage) : await fetchPage(flags.page);
      outputList(this, data, {
        defaultFields: [
          'id', 'target.nameSnapshot', 'target.targetType', 'trackingType', 'cadence', 'periodStart', 'sourceCount',
        ],
        fields: flags.fields,
        json: flags.json,
        noun: 'tracking reports',
        sort: flags.sort,
      });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }

  private fetchPage(page: number, limit: number, flags: TrackingReportListFlags): Promise<Record<string, unknown>> {
    const query = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (flags['target-type']) query.set('targetType', flags['target-type']);
    if (flags['target-id']) query.set('targetId', flags['target-id']);
    if (flags.keyword) query.set('keyword', flags.keyword);
    if (flags['tracking-type']) query.set('trackingType', flags['tracking-type']);
    if (flags.cadence) query.set('cadence', flags.cadence);
    if (flags['period-start']) query.set('periodStart', flags['period-start']);
    if (flags['period-end']) query.set('periodEnd', flags['period-end']);
    return fetchApi(`/tracking-reports?${query}`, {}, this.config.configDir);
  }
}
