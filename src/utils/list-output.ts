import { Command, Flags } from '@oclif/core';

import { outputResult } from './output.js';

export const allFlag = Flags.boolean({
  description: 'Fetch every result page',
  exclusive: ['page'],
});
export const fieldsFlag = Flags.string({
  description: 'Comma-separated fields to show in the table',
});
export const sortFlag = Flags.string({
  description: 'Table sort field with optional :asc or :desc suffix',
});

export function validateListFlags(options: { fields?: string; json?: boolean; sort?: string }): void {
  if (options.json && (options.fields || options.sort)) {
    throw new Error('--fields and --sort are only available for table output; remove --json.');
  }
}

type PageFetcher = (page: number) => Promise<Record<string, unknown>>;

interface PageCollection {
  fetchPage: PageFetcher;
  items: unknown[];
  key: 'data' | 'items';
  totalPages: number;
}

function itemKey(response: Record<string, unknown>): 'data' | 'items' {
  if (Array.isArray(response.data)) return 'data';
  if (Array.isArray(response.items)) return 'items';
  throw new Error('API list response does not contain a data or items array.');
}

async function collectRemainingPages(
  collection: PageCollection,
  page: number
): Promise<void> {
  if (page > collection.totalPages) return;
  const response = await collection.fetchPage(page);
  const pageItems = response[collection.key];
  if (!Array.isArray(pageItems)) {
    throw new TypeError(`API page ${page} does not contain a ${collection.key} array.`);
  }

  collection.items.push(...pageItems);
  return collectRemainingPages(collection, page + 1);
}

export async function fetchAllPages(fetchPage: PageFetcher): Promise<Record<string, unknown>> {
  const firstPage = await fetchPage(1);
  const key = itemKey(firstPage);
  const items = [...(firstPage[key] as unknown[])];
  const totalPages = typeof firstPage.totalPages === 'number' ? firstPage.totalPages : 1;
  await collectRemainingPages({ fetchPage, items, key, totalPages }, 2);
  return { ...firstPage, [key]: items, page: 1 };
}

function fieldValue(item: unknown, field: string): unknown {
  let value = item;
  for (const segment of field.split('.')) {
    if (!value || typeof value !== 'object') return;
    value = (value as Record<string, unknown>)[segment];
  }

  return value;
}

function hasField(item: unknown, field: string): boolean {
  let value = item;
  for (const segment of field.split('.')) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, segment)) return false;
    value = (value as Record<string, unknown>)[segment];
  }

  return true;
}

function requireKnownField(items: unknown[], field: string, flag: '--fields' | '--sort'): void {
  if (items.length > 0 && !items.some((item) => hasField(item, field))) {
    throw new Error(`${flag} references an unknown field: ${field}.`);
  }
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function selectedFields(value: string | undefined, defaults: string[], items: unknown[]): string[] {
  if (!value) return defaults;
  const fields = value.split(',').map((field) => field.trim()).filter(Boolean);
  if (fields.length === 0) throw new Error('--fields must contain at least one field name.');
  for (const field of fields) requireKnownField(items, field, '--fields');
  return fields;
}

function sortedItems(items: unknown[], sort: string | undefined): unknown[] {
  if (!sort) return items;
  const [field, direction = 'asc', ...extra] = sort.split(':');
  if (!field || extra.length > 0 || (direction !== 'asc' && direction !== 'desc')) {
    throw new Error('--sort must use FIELD, FIELD:asc, or FIELD:desc.');
  }

  requireKnownField(items, field, '--sort');

  const multiplier = direction === 'asc' ? 1 : -1;
  return [...items].sort((left, right) => {
    const leftValue = displayValue(fieldValue(left, field));
    const rightValue = displayValue(fieldValue(right, field));
    return leftValue.localeCompare(rightValue, undefined, { numeric: true }) * multiplier;
  });
}

function renderTable(command: Command, items: unknown[], fields: string[]): void {
  const rows = items.map((item) => fields.map((field) => displayValue(fieldValue(item, field))));
  const widths = fields.map((field, index) =>
    Math.min(40, Math.max(field.length, ...rows.map((row) => row[index].length)))
  );
  const formatRow = (row: string[]) =>
    row.map((cell, index) => cell.slice(0, widths[index]).padEnd(widths[index])).join('  ').trimEnd();

  command.log(formatRow(fields));
  command.log(widths.map((width) => '─'.repeat(width)).join('  '));
  for (const row of rows) command.log(formatRow(row));
}

export function outputList(
  command: Command,
  response: Record<string, unknown>,
  options: {
    defaultFields: string[];
    fields?: string;
    json?: boolean;
    noun: string;
    sort?: string;
  }
): void {
  if (options.json) {
    outputResult(command, response, { json: true });
    return;
  }

  const key = itemKey(response);
  const items = response[key] as unknown[];
  const fields = selectedFields(options.fields, options.defaultFields, items);
  const sorted = sortedItems(items, options.sort);
  if (items.length === 0) {
    command.log(`No ${options.noun} found.`);
    return;
  }

  renderTable(command, sorted, fields);
  const total = typeof response.total === 'number' ? response.total : items.length;
  command.log(`\nShowing ${items.length} of ${total} ${options.noun}.`);
}
