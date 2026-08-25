import { Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { readMetadataInput, readSourcesInput, readTextInput } from '../../utils/tracking-report-input.js';
import {
  TRACKING_REPORT_CADENCES,
  TRACKING_REPORT_TYPES,
  TRACKING_TARGET_TYPES,
  validateIanaTimezone,
  validateIsoDateTime,
} from '../../utils/validation.js';

export default class TrackingReportCreate extends NoveCommand {
  static description = 'Create a tracking report';
  static flags = {
    'ai-model': Flags.string({ description: 'AI model used to generate the report' }),
    'base-date': Flags.string({ description: 'ISO 8601 date-time used to locate the report period', required: true }),
    cadence: Flags.string({ description: 'Report cadence', options: [...TRACKING_REPORT_CADENCES], required: true }),
    content: Flags.string({ description: 'Report content' }),
    'content-file': Flags.file({ description: 'Read report content from a UTF-8 file', exists: true }),
    'generated-by': Flags.string({ description: 'Generation method', options: ['AI', 'HYBRID', 'MANUAL'] }),
    json: jsonFlag,
    sources: Flags.string({ description: 'JSON array of report sources' }),
    'sources-file': Flags.file({ description: 'Read report sources from a JSON file', exists: true }),
    'target-id': Flags.string({ description: 'Business object ID of the tracking target', required: true }),
    'target-metadata': Flags.string({ description: 'Tracking target metadata as a JSON object' }),
    'target-metadata-file': Flags.file({ description: 'Read tracking target metadata from a JSON file', exists: true }),
    'target-name': Flags.string({ description: 'Tracking target name snapshot', required: true }),
    'target-type': Flags.string({ description: 'Tracking target type', options: [...TRACKING_TARGET_TYPES], required: true }),
    timezone: Flags.string({ default: 'Asia/Shanghai', description: 'IANA timezone used to calculate the report period' }),
    'tracking-type': Flags.string({ description: 'Tracking report type', options: [...TRACKING_REPORT_TYPES], required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TrackingReportCreate);
    try {
      validateIsoDateTime(flags['base-date'], 'Base date');
      validateIanaTimezone(flags.timezone);
      const [content, targetMetadata, sources] = await Promise.all([
        readTextInput({ file: flags['content-file'], inline: flags.content, label: 'content', required: true }),
        readMetadataInput({
          file: flags['target-metadata-file'],
          inline: flags['target-metadata'],
          label: 'target-metadata',
        }),
        readSourcesInput({ file: flags['sources-file'], inline: flags.sources, label: 'sources' }),
      ]);
      const body = Object.fromEntries(Object.entries({
        aiModel: flags['ai-model'],
        baseDate: flags['base-date'],
        cadence: flags.cadence,
        content,
        generatedBy: flags['generated-by'],
        sources,
        targetId: flags['target-id'],
        targetMetadata,
        targetName: flags['target-name'],
        targetType: flags['target-type'],
        timezone: flags.timezone,
        trackingType: flags['tracking-type'],
      }).filter(([, value]) => value !== undefined));
      const data = await fetchApi('/tracking-reports', {
        body: JSON.stringify(body),
        method: 'POST',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Tracking report created successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
