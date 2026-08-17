import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';

export default class UserCreate extends Command {
  static description = 'Create a new user';
  static flags = {
    active: Flags.boolean({ allowNo: true, description: 'Active status' }),
    address: Flags.string({ description: 'Detailed address' }),
    avatar: Flags.string({ description: 'Avatar URL' }),
    bio: Flags.string({ description: 'Biography' }),
    city: Flags.string({ description: 'City' }),
    country: Flags.string({ description: 'Country' }),
    countryCode: Flags.string({ description: 'Country code (e.g. +86)' }),
    dateOfBirth: Flags.string({ description: 'Date of birth (YYYY-MM-DD)' }),
    displayName: Flags.string({ description: 'Display name' }),
    email: Flags.string({ description: 'Email address' }),
    firstName: Flags.string({ description: 'First name' }),
    gender: Flags.string({ description: 'Gender (e.g. MALE, FEMALE, OTHER)' }),
    lastName: Flags.string({ description: 'Last name' }),
    phone: Flags.string({ description: 'Phone number without country code' }),
    username: Flags.string({ description: 'Username' }),
    website: Flags.string({ description: 'Personal website URL' }),
    zipCode: Flags.string({ description: 'Zip code' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserCreate);

    try {
      const data = await fetchApi(
        `/admin/users`,
        {
          body: JSON.stringify(flags),
          method: 'POST',
        },
        this.config.configDir
      );
      this.log('✅ User created successfully.');
      this.log(JSON.stringify(data, null, 2));
    } catch (error: unknown) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
