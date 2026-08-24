import { Command, Flags } from '@oclif/core';

import { fetchApi } from '../../utils/api.js';
import { handleCommandError, jsonFlag, outputResult } from '../../utils/output.js';

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
    json: jsonFlag,
    lastName: Flags.string({ description: 'Last name' }),
    phone: Flags.string({ description: 'Phone number without country code' }),
    username: Flags.string({ description: 'Username' }),
    website: Flags.string({ description: 'Personal website URL' }),
    zipCode: Flags.string({ description: 'Zip code' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserCreate);
    const { json, ...body } = flags;

    try {
      const data = await fetchApi(
        `/admin/users`,
        {
          body: JSON.stringify(body),
          method: 'POST',
        },
        this.config.configDir
      );
      outputResult(this, data, {
        json,
        successMessage: '✅ User created successfully.',
      });
    } catch (error: unknown) {
      handleCommandError(this, error, json);
    }
  }
}
