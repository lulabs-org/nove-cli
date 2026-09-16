import { Flags } from '@oclif/core';

import { parseJsonObject } from './json-input.js';
import {
  PROJECT_LEVELS,
  PROJECT_STATUSES,
  validateHttpUrl,
  validateIsoDateTime,
} from './validation.js';

const CLEARABLE_PROJECT_FIELDS = [
  'subtitle',
  'slug',
  'category',
  'image',
  'description',
  'duration',
  'max-students',
  'prerequisites',
  'outcomes',
  'tags',
  'owner-id',
  'product-id',
  'start-date',
  'end-date',
  'enroll-deadline',
] as const;

const baseProjectFlags = {
  category: Flags.string({ description: 'Project category' }),
  description: Flags.string({ description: 'Detailed project description' }),
  duration: Flags.string({ description: 'Project duration, for example 8 weeks' }),
  'end-date': Flags.string({ description: 'End ISO 8601 date-time with timezone' }),
  'enroll-deadline': Flags.string({ description: 'Enrollment deadline ISO 8601 date-time with timezone' }),
  featured: Flags.boolean({ allowNo: true, description: 'Mark the project as featured' }),
  image: Flags.string({ description: 'Absolute site image path or HTTP(S) URL' }),
  level: Flags.string({ description: 'Project level', options: [...PROJECT_LEVELS] }),
  'max-students': Flags.integer({ description: 'Maximum student count', min: 0 }),
  metadata: Flags.string({ description: 'Metadata as a JSON object' }),
  outcome: Flags.string({ description: 'Expected outcome; repeat for multiple values', multiple: true }),
  'owner-id': Flags.string({ description: 'Owner local user ID' }),
  prerequisite: Flags.string({ description: 'Prerequisite; repeat for multiple values', multiple: true }),
  'product-id': Flags.string({ description: 'Related product ID' }),
  slug: Flags.string({ description: 'Optional URL-safe project slug' }),
  'sort-order': Flags.integer({ description: 'Display sort order' }),
  'start-date': Flags.string({ description: 'Start ISO 8601 date-time with timezone' }),
  status: Flags.string({ description: 'Project status', options: [...PROJECT_STATUSES] }),
  subtitle: Flags.string({ description: 'Project subtitle' }),
  tag: Flags.string({ description: 'Project tag; repeat for multiple tags', multiple: true }),
  title: Flags.string({ description: 'Project title' }),
};

export const projectCreateFlags = {
  ...baseProjectFlags,
  title: Flags.string({ description: 'Project title', required: true }),
};

export const projectUpdateFlags = {
  ...baseProjectFlags,
  clear: Flags.string({
    description: 'Clear a nullable field; repeat for multiple fields',
    multiple: true,
    options: [...CLEARABLE_PROJECT_FIELDS],
  }),
};

type ProjectFlags = Record<string, boolean | number | string | string[] | undefined>;

const projectFields: Record<string, string> = {
  category: 'category',
  description: 'description',
  duration: 'duration',
  'end-date': 'endDate',
  'enroll-deadline': 'enrollDeadline',
  featured: 'isFeatured',
  image: 'image',
  level: 'level',
  'max-students': 'maxStudents',
  outcome: 'outcomes',
  'owner-id': 'ownerId',
  prerequisite: 'prerequisites',
  'product-id': 'productId',
  slug: 'slug',
  'sort-order': 'sortOrder',
  'start-date': 'startDate',
  status: 'status',
  subtitle: 'subtitle',
  tag: 'tags',
  title: 'title',
};

const clearProjectFields: Record<string, string> = {
  category: 'category',
  description: 'description',
  duration: 'duration',
  'end-date': 'endDate',
  'enroll-deadline': 'enrollDeadline',
  image: 'image',
  'max-students': 'maxStudents',
  outcomes: 'outcomes',
  'owner-id': 'ownerId',
  prerequisites: 'prerequisites',
  'product-id': 'productId',
  slug: 'slug',
  'start-date': 'startDate',
  subtitle: 'subtitle',
  tags: 'tags',
};

function validateImage(value: string): void {
  if (value.startsWith('/') && !value.startsWith('//')) return;
  validateHttpUrl(value, '--image');
}

function validateProjectDates(startDate?: string, endDate?: string, deadline?: string): void {
  if (startDate) validateIsoDateTime(startDate, '--start-date');
  if (endDate) validateIsoDateTime(endDate, '--end-date');
  if (deadline) validateIsoDateTime(deadline, '--enroll-deadline');
  if (startDate && endDate && Date.parse(endDate) < Date.parse(startDate)) {
    throw new Error('--end-date cannot be before --start-date.');
  }
}

export function projectBody(flags: ProjectFlags): Record<string, unknown> {
  if (typeof flags.title === 'string' && (flags.title.trim().length === 0 || flags.title.trim().length > 150)) {
    throw new Error('--title must contain 1 to 150 characters.');
  }

  if (typeof flags.image === 'string') validateImage(flags.image);
  validateProjectDates(
    flags['start-date'] as string | undefined,
    flags['end-date'] as string | undefined,
    flags['enroll-deadline'] as string | undefined,
  );
  const body: Record<string, unknown> = {};
  for (const [flagName, fieldName] of Object.entries(projectFields)) {
    const value = flags[flagName];
    if (value !== undefined) body[fieldName] = value;
  }

  if (typeof flags.slug === 'string') {
    body.slug = flags.slug
      .trim()
      .toLowerCase()
      .replaceAll(/[\s_]+/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '');
  }

  const metadata = parseJsonObject(flags.metadata as string | undefined, '--metadata');
  if (metadata !== undefined) body.metadata = metadata;

  for (const flagName of (flags.clear as string[] | undefined) ?? []) {
    const sourceFlag =
      flagName === 'tags'
        ? 'tag'
        : flagName === 'outcomes'
          ? 'outcome'
          : flagName === 'prerequisites'
            ? 'prerequisite'
            : flagName;
    if (flags[sourceFlag] !== undefined) {
      throw new Error(`--${sourceFlag} cannot be combined with --clear ${flagName}.`);
    }

    body[clearProjectFields[flagName]] = ['outcomes', 'prerequisites', 'tags'].includes(flagName)
      ? []
      : null;
  }

  return body;
}
