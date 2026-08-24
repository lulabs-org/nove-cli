import { Flags } from '@oclif/core';

import {
  GENDERS,
  validateCountryCode,
  validateDateOnly,
  validateEmail,
  validateHttpUrl,
  validatePhone,
} from './validation.js';

export const adminUserFlags = {
  active: Flags.boolean({ allowNo: true, description: 'Active status' }),
  address: Flags.string({ description: 'Detailed address' }),
  avatar: Flags.string({ description: 'Avatar URL' }),
  bio: Flags.string({ description: 'Biography' }),
  city: Flags.string({ description: 'City' }),
  country: Flags.string({ description: 'Country' }),
  'country-code': Flags.string({ aliases: ['countryCode'], description: 'Country code (for example +86)' }),
  'date-of-birth': Flags.string({ aliases: ['dateOfBirth'], description: 'Date of birth (YYYY-MM-DD)' }),
  'display-name': Flags.string({ aliases: ['displayName'], description: 'Display name' }),
  email: Flags.string({ description: 'Email address' }),
  'first-name': Flags.string({ aliases: ['firstName'], description: 'First name' }),
  gender: Flags.string({ description: 'Gender', options: [...GENDERS] }),
  'last-name': Flags.string({ aliases: ['lastName'], description: 'Last name' }),
  phone: Flags.string({ description: 'Phone number without country code' }),
  username: Flags.string({ description: 'Username' }),
  website: Flags.string({ description: 'Personal website URL' }),
  'zip-code': Flags.string({ aliases: ['zipCode'], description: 'Zip code' }),
};

export function adminUserBody(
  flags: Record<string, unknown>,
  options: { requirePhonePair?: boolean } = {}
): Record<string, unknown> {
  const email = flags.email as string | undefined;
  const phone = flags.phone as string | undefined;
  const countryCode = flags['country-code'] as string | undefined;
  const avatar = flags.avatar as string | undefined;
  const website = flags.website as string | undefined;
  const dateOfBirth = flags['date-of-birth'] as string | undefined;
  const username = flags.username as string | undefined;

  if (email) validateEmail(email);
  if (phone) validatePhone(phone);
  if (countryCode) validateCountryCode(countryCode);
  if (avatar) validateHttpUrl(avatar, 'Avatar URL');
  if (website) validateHttpUrl(website, 'Website URL');
  if (dateOfBirth) validateDateOnly(dateOfBirth, 'Date of birth');
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('Username may contain only letters, numbers, and underscores.');
  }

  if (options.requirePhonePair && Boolean(phone) !== Boolean(countryCode)) {
    throw new Error('Phone number and country code must be supplied together.');
  }

  return Object.fromEntries(Object.entries({
    active: flags.active,
    address: flags.address,
    avatar,
    bio: flags.bio,
    city: flags.city,
    country: flags.country,
    countryCode,
    dateOfBirth,
    displayName: flags['display-name'],
    email,
    firstName: flags['first-name'],
    gender: flags.gender,
    lastName: flags['last-name'],
    phone,
    username,
    website,
    zipCode: flags['zip-code'],
  }).filter(([, value]) => value !== undefined));
}
