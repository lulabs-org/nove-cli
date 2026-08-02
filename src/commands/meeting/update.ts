import { Command, Args, Flags } from '@oclif/core';
import { fetchApi } from '../../utils/api.js';

export default class MeetingUpdate extends Command {
  static description = 'Update a meeting record';

  static args = {
    id: Args.string({ description: 'Meeting ID', required: true }),
  };

  static flags = {
    title: Flags.string({ description: 'New meeting title' }),
    status: Flags.string({ description: 'New status' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MeetingUpdate);

    // Remove undefined flags
    const body = Object.fromEntries(Object.entries(flags).filter(([_, v]) => v !== undefined));

    if (Object.keys(body).length === 0) {
      this.error('No update parameters provided. Use --title or --status.');
    }

    try {
      const data = await fetchApi(
        `/meetings/${args.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        },
        this.config.configDir
      );
      this.log('✅ Meeting updated successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
      this.error(error.message);
    }
  }
}
