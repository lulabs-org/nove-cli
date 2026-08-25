import { Args, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { NoveCommand } from '../../utils/nove-command.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';
import { readSourcesInput, readTextInput } from '../../utils/tracking-report-input.js';

export default class TrackingReportUpdate extends NoveCommand {
  static args = { id: Args.string({ description: 'Tracking report ID', required: true }) };
  static description = 'Update a tracking report';
  static flags = {
    'ai-model': Flags.string({ description: 'AI model used to generate the report' }),
    'clear-ai-model': Flags.boolean({ description: 'Clear the stored AI model' }),
    'clear-generated-by': Flags.boolean({ description: 'Clear the stored generation method' }),
    content: Flags.string({ description: 'Report content' }),
    'content-file': Flags.file({ description: 'Read report content from a UTF-8 file', exists: true }),
    'generated-by': Flags.string({ description: 'Generation method', options: ['AI', 'HYBRID', 'MANUAL'] }),
    json: jsonFlag,
    sources: Flags.string({ description: 'Replacement report sources as a JSON array' }),
    'sources-file': Flags.file({ description: 'Read replacement report sources from a JSON file', exists: true }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(TrackingReportUpdate);
    try {
      if (flags['ai-model'] !== undefined && flags['clear-ai-model']) {
        throw new Error('--ai-model cannot be combined with --clear-ai-model.');
      }

      if (flags['generated-by'] !== undefined && flags['clear-generated-by']) {
        throw new Error('--generated-by cannot be combined with --clear-generated-by.');
      }

      const [content, sources] = await Promise.all([
        readTextInput({ file: flags['content-file'], inline: flags.content, label: 'content' }),
        readSourcesInput({ file: flags['sources-file'], inline: flags.sources, label: 'sources' }),
      ]);
      const body = Object.fromEntries(Object.entries({
        aiModel: flags['clear-ai-model'] ? null : flags['ai-model'],
        content,
        generatedBy: flags['clear-generated-by'] ? null : flags['generated-by'],
        sources,
      }).filter(([, value]) => value !== undefined));
      if (Object.keys(body).length === 0) throw new Error('No fields provided to update.');

      const data = await fetchApi(`/tracking-reports/${args.id}`, {
        body: JSON.stringify(body),
        method: 'PUT',
      }, this.config.configDir);
      outputResult(this, data, { json: flags.json, successMessage: 'Tracking report updated successfully.' });
    } catch (error: unknown) {
      handleCommandError(this, error, flags.json);
    }
  }
}
