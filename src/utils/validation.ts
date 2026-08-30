import path from 'node:path';

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export const MEETING_PLATFORMS = [
  'TENCENT_MEETING', 'ZOOM', 'TEAMS', 'DINGTALK', 'FEISHU', 'WEBEX', 'VOOV', 'OTHER',
] as const;
export const MEETING_TYPES = ['ONE_TIME', 'RECURRING', 'INSTANT', 'SCHEDULED', 'WEBINAR'] as const;
export const PROCESSING_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'] as const;
export const RECORDING_SOURCES = ['PLATFORM_AUTO', 'USER_MANUAL', 'THIRD_PARTY'] as const;
export const USER_SORT_FIELDS = ['createdAt', 'updatedAt', 'lastLoginAt', 'username', 'email'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const CURRENCIES = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD', 'TWD', 'SGD', 'AUD', 'CAD'] as const;
export const ORDER_STATUSES = ['UNPAID', 'PAID', 'CANCELLED', 'REFUNDED', 'COMPLETED'] as const;
export const PAYMENT_PROVIDERS = ['STRIPE', 'PAYPAL', 'WECHAT', 'ALIPAY', 'APPLE_PAY', 'GOOGLE_PAY', 'OTHER'] as const;
export const PRODUCT_CATEGORIES = ['COURSE', 'MEMBERSHIP', 'CONSULTATION', 'MATERIAL', 'OTHER'] as const;
export const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'] as const;
export const TRACKING_REPORT_CADENCES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export const TRACKING_REPORT_TYPES = [
  'MEETING_SUMMARY', 'TRAINING_PLAN', 'DEVELOPMENT_PLAN', 'PROJECT_PROGRESS', 'USER_PROFILE',
] as const;
export const TRACKING_SOURCE_TYPES = ['SPEAKER_SUMMARY', 'TRACKING_REPORT', 'DOCUMENT', 'MEETING'] as const;
export const TRACKING_TARGET_TYPES = ['USER', 'PLATFORM_USER', 'PROJECT', 'ORGANIZATION'] as const;

const ISO_WITH_TIMEZONE = /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function validateHttpUrl(value: string, label = 'URL'): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${label} must use http or https.`);
  }

  return value;
}

export function validateEmail(value: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Email address is invalid.');
  return value;
}

export function validatePhone(value: string): string {
  if (!/^[\d\s()+-]+$/.test(value) || value.replaceAll(/\D/g, '').length < 4) {
    throw new Error('Phone number is invalid.');
  }

  return value;
}

export function validateCountryCode(value: string): string {
  if (!/^\+?\d{1,4}$/.test(value)) throw new Error('Country code is invalid.');
  return value;
}

export function validateDateOnly(value: string, label = 'Date'): string {
  const match = DATE_ONLY.exec(value);
  if (!match) throw new Error(`${label} must use YYYY-MM-DD format.`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`${label} is invalid.`);
  }

  return value;
}

export function validateIsoDateTime(value: string, label: string): string {
  if (!ISO_WITH_TIMEZONE.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be a valid ISO 8601 date-time with an explicit timezone.`);
  }

  return value;
}

export function validateIanaTimezone(value: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
  } catch {
    throw new Error(`Invalid IANA timezone: ${value}`);
  }

  return value;
}

export function validateDateRange(startDate?: string, endDate?: string): void {
  if (startDate) validateIsoDateTime(startDate, 'Start date');
  if (endDate) validateIsoDateTime(endDate, 'End date');
  if (startDate && endDate && Date.parse(startDate) >= Date.parse(endDate)) {
    throw new Error('Start date must be earlier than end date.');
  }
}

export function validateImportFile(value: string): string {
  const extension = path.extname(value).toLowerCase();
  if (extension !== '.csv' && extension !== '.xlsx') {
    throw new Error('Import file must have a .csv or .xlsx extension.');
  }

  return value;
}

function timeZoneParts(date: Date, timeZone: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', month: '2-digit',
    second: '2-digit', timeZone, year: 'numeric',
  }).formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value === '24' && part.type === 'hour' ? '0' : part.value)])
  );
}

function zonedMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const targetUtc = Date.UTC(year, month - 1, day);
  let candidate = targetUtc;
  for (let iteration = 0; iteration < 2; iteration++) {
    const parts = timeZoneParts(new Date(candidate), timeZone);
    const representedUtc = Date.UTC(
      parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second,
    );
    candidate -= representedUtc - targetUtc;
  }

  return new Date(candidate);
}

export function dayRange(dateValue: string, timeZone: string): { endDate: string; startDate: string } {
  validateDateOnly(dateValue);
  validateIanaTimezone(timeZone);

  const [year, month, day] = dateValue.split('-').map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    endDate: zonedMidnight(
      nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate(), timeZone,
    ).toISOString(),
    startDate: zonedMidnight(year, month, day, timeZone).toISOString(),
  };
}

export function resolveDateRange(options: {
  date?: string;
  endDate?: string;
  startDate?: string;
  timeZone: string;
}): { endDate?: string; startDate?: string } {
  if (options.date && (options.startDate || options.endDate)) {
    throw new Error('--date cannot be combined with --start-date or --end-date.');
  }

  if (options.date) return dayRange(options.date, options.timeZone);
  validateDateRange(options.startDate, options.endDate);
  return { endDate: options.endDate, startDate: options.startDate };
}
