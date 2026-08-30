import { Flags } from '@oclif/core';

import {
  CURRENCIES,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  validateHttpUrl,
  validateIsoDateTime,
} from './validation.js';

const CLEARABLE_PRODUCT_FIELDS = [
  'description', 'short-description', 'price', 'original-price', 'duration-days', 'max-users',
  'tags', 'image-url', 'video-url', 'download-url', 'external-url', 'rating', 'published-at',
] as const;

const baseProductFlags = {
  category: Flags.string({ description: 'Product category', options: [...PRODUCT_CATEGORIES] }),
  currency: Flags.string({ description: 'Currency', options: [...CURRENCIES] }),
  description: Flags.string({ description: 'Detailed product description' }),
  'download-url': Flags.string({ description: 'Download URL' }),
  'duration-days': Flags.integer({ description: 'Validity period in days', min: 1 }),
  'external-url': Flags.string({ description: 'External product URL' }),
  featured: Flags.boolean({ allowNo: true, description: 'Mark the product as featured' }),
  'image-url': Flags.string({ description: 'Image URL' }),
  'max-users': Flags.integer({ description: 'Maximum number of users', min: 1 }),
  name: Flags.string({ description: 'Product name' }),
  'original-price': Flags.integer({ description: 'Original price in the smallest currency unit', min: 0 }),
  price: Flags.integer({ description: 'Price in the smallest currency unit', min: 0 }),
  'product-code': Flags.string({ description: 'Unique product code' }),
  'published-at': Flags.string({ description: 'Published ISO 8601 date-time with timezone' }),
  rating: Flags.string({ description: 'Rating from 0 to 5' }),
  recommended: Flags.boolean({ allowNo: true, description: 'Mark the product as recommended' }),
  'short-description': Flags.string({ description: 'Short product description' }),
  'sort-order': Flags.integer({ description: 'Display sort order' }),
  status: Flags.string({ description: 'Product status', options: [...PRODUCT_STATUSES] }),
  tag: Flags.string({ description: 'Product tag; repeat for multiple tags', multiple: true }),
  'video-url': Flags.string({ description: 'Video URL' }),
};

export const productCreateFlags = {
  ...baseProductFlags,
  category: Flags.string({ description: 'Product category', options: [...PRODUCT_CATEGORIES], required: true }),
  name: Flags.string({ description: 'Product name', required: true }),
  'product-code': Flags.string({ description: 'Unique product code', required: true }),
};

export const productUpdateFlags = {
  ...baseProductFlags,
  clear: Flags.string({
    description: 'Clear a nullable field; repeat for multiple fields',
    multiple: true,
    options: [...CLEARABLE_PRODUCT_FIELDS],
  }),
};

type ProductFlags = Record<string, boolean | number | string | string[] | undefined>;

const productFields: Record<string, string> = {
  category: 'category',
  currency: 'currency',
  description: 'description',
  'download-url': 'downloadUrl',
  'duration-days': 'durationDays',
  'external-url': 'externalUrl',
  featured: 'isFeatured',
  'image-url': 'imageUrl',
  'max-users': 'maxUsers',
  name: 'name',
  'original-price': 'originalPrice',
  price: 'price',
  'product-code': 'productCode',
  'published-at': 'publishedAt',
  rating: 'rating',
  recommended: 'isRecommended',
  'short-description': 'shortDescription',
  'sort-order': 'sortOrder',
  status: 'status',
  tag: 'tags',
  'video-url': 'videoUrl',
};

const clearProductFields: Record<string, string> = {
  ...productFields,
  tags: 'tags',
};

export function productBody(flags: ProductFlags): Record<string, unknown> {
  for (const name of ['image-url', 'video-url', 'download-url', 'external-url']) {
    const value = flags[name];
    if (typeof value === 'string') validateHttpUrl(value, `--${name}`);
  }

  if (typeof flags['published-at'] === 'string') {
    validateIsoDateTime(flags['published-at'], '--published-at');
  }

  let rating: number | undefined;
  if (typeof flags.rating === 'string') {
    rating = Number(flags.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      throw new Error('--rating must be a number from 0 to 5.');
    }
  }

  const body: Record<string, unknown> = {};
  for (const [flagName, fieldName] of Object.entries(productFields)) {
    const value = flagName === 'rating' ? rating : flags[flagName];
    if (value !== undefined) body[fieldName] = value;
  }

  for (const flagName of (flags.clear as string[] | undefined) ?? []) {
    const sourceFlag = flagName === 'tags' ? 'tag' : flagName;
    if (flags[sourceFlag] !== undefined) {
      throw new Error(`--${flagName} cannot be combined with --clear ${flagName}.`);
    }

    body[clearProductFields[flagName]] = flagName === 'tags' ? [] : null;
  }

  return body;
}
