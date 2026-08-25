import { readFile } from 'node:fs/promises';

import { TRACKING_SOURCE_TYPES } from './validation.js';

interface InputOptions {
  file?: string;
  inline?: string;
  label: string;
  required?: boolean;
}

interface TrackingReportSourceInput {
  metadata?: Record<string, unknown>;
  sourceId: string;
  sourceType: string;
}

function validateInputSelection(options: InputOptions): void {
  if (options.inline !== undefined && options.file !== undefined) {
    throw new Error(`--${options.label} cannot be combined with --${options.label}-file.`);
  }

  if (options.required && options.inline === undefined && options.file === undefined) {
    throw new Error(`Provide --${options.label} or --${options.label}-file.`);
  }
}

async function inputValue(options: InputOptions): Promise<string | undefined> {
  validateInputSelection(options);
  if (options.inline !== undefined) return options.inline;
  if (options.file === undefined) return;

  try {
    return await readFile(options.file, 'utf8');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read ${options.label} file: ${message}`);
  }
}

function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function readTextInput(options: InputOptions): Promise<string | undefined> {
  return inputValue(options);
}

export async function readMetadataInput(options: InputOptions): Promise<Record<string, unknown> | undefined> {
  const value = await inputValue(options);
  if (value === undefined) return;
  const parsed = parseJson(value, options.label);
  if (!isObject(parsed)) throw new Error(`${options.label} must be a JSON object.`);
  return parsed;
}

export async function readSourcesInput(options: InputOptions): Promise<TrackingReportSourceInput[] | undefined> {
  const value = await inputValue(options);
  if (value === undefined) return;
  const parsed = parseJson(value, options.label);
  if (!Array.isArray(parsed)) throw new Error(`${options.label} must be a JSON array.`);

  return parsed.map((source, index) => {
    if (!isObject(source)) throw new Error(`${options.label}[${index}] must be a JSON object.`);
    if (typeof source.sourceType !== 'string' || !TRACKING_SOURCE_TYPES.includes(source.sourceType as never)) {
      throw new Error(`${options.label}[${index}].sourceType must be one of: ${TRACKING_SOURCE_TYPES.join(', ')}.`);
    }

    if (typeof source.sourceId !== 'string' || source.sourceId.trim() === '') {
      throw new Error(`${options.label}[${index}].sourceId must be a non-empty string.`);
    }

    if (source.metadata !== undefined && !isObject(source.metadata)) {
      throw new Error(`${options.label}[${index}].metadata must be a JSON object.`);
    }

    return {
      metadata: source.metadata,
      sourceId: source.sourceId,
      sourceType: source.sourceType,
    };
  });
}
