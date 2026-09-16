import { createHash } from 'node:crypto';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';

import { fetchApi } from './api.js';

const MIME_MAP: Record<string, string> = {
  '.csv': 'text/csv',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.m4a': 'audio/m4a',
  '.md': 'text/markdown',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

export function detectMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  return MIME_MAP[extension] ?? 'application/octet-stream';
}

export function computeFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function readChunk(filePath: string, start: number, end: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { end, start });
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export interface UploadFileOptions {
  configDir: string;
  contentType?: string;
  fileName?: string;
  filePath: string;
  onProgress?: (uploadedParts: number, totalParts: number) => void;
  parentId?: string;
  spaceId: string;
}

interface UploadSessionResponse {
  expiresAt: string;
  id: string;
  recommendedPartSizeBytes: number;
  requiresMalwareScan: boolean;
}

interface SignPartsResponse {
  parts: Array<{ partNumber: number; url: string }>;
}

interface UploadPartContext {
  completedParts: Array<{ etag: string; number: number }>;
  filePath: string;
  onProgress?: (uploadedParts: number, totalParts: number) => void;
  partIndex: number;
  partSize: number;
  signed: SignPartsResponse;
  statsSize: number;
  totalParts: number;
}

async function uploadPartsSequentially(ctx: UploadPartContext): Promise<void> {
  if (ctx.partIndex >= ctx.totalParts) return;
  const partNumber = ctx.partIndex + 1;
  const partInfo = ctx.signed.parts.find((part) => part.partNumber === partNumber);
  if (!partInfo) {
    throw new Error(`Missing presigned URL for part number ${partNumber}`);
  }

  const start = ctx.partIndex * ctx.partSize;
  const end = ctx.statsSize === 0 ? 0 : Math.min(ctx.statsSize - 1, start + ctx.partSize - 1);
  const chunk = ctx.statsSize === 0 ? Buffer.alloc(0) : await readChunk(ctx.filePath, start, end);

  const putResponse = await globalThis.fetch(partInfo.url, {
    body: new Uint8Array(chunk),
    headers: {
      'Content-Length': String(chunk.length),
    },
    method: 'PUT',
  });

  if (!putResponse.ok) {
    throw new Error(`Failed to upload part ${partNumber}: HTTP ${putResponse.status}`);
  }

  const etagHeader = putResponse.headers.get('etag') ?? `part-${partNumber}`;
  const etag = etagHeader.replaceAll('"', '').trim();
  ctx.completedParts.push({ etag, number: partNumber });

  if (ctx.onProgress) {
    ctx.onProgress(partNumber, ctx.totalParts);
  }

  return uploadPartsSequentially({ ...ctx, partIndex: ctx.partIndex + 1 });
}

export async function uploadFileToDrive(options: UploadFileOptions): Promise<Record<string, unknown>> {
  const stats = statSync(options.filePath);
  if (!stats.isFile()) {
    throw new Error(`The target path is not a file: ${options.filePath}`);
  }

  const sizeBytes = BigInt(stats.size);
  const checksumSha256 = await computeFileSha256(options.filePath);
  const fileName = options.fileName ?? path.basename(options.filePath);
  const contentType = options.contentType ?? detectMimeType(fileName);

  const session = await fetchApi<UploadSessionResponse>(
    '/drive/upload-sessions',
    {
      body: JSON.stringify({
        checksumSha256,
        contentType,
        fileName,
        parentId: options.parentId,
        sizeBytes: sizeBytes.toString(),
        spaceId: options.spaceId,
      }),
      method: 'POST',
    },
    options.configDir
  );

  const partSize = session.recommendedPartSizeBytes > 0 ? session.recommendedPartSizeBytes : 16 * 1024 * 1024;
  const totalParts = stats.size === 0 ? 1 : Math.ceil(stats.size / partSize);
  const partNumbers = Array.from({ length: totalParts }, (_, index) => index + 1);

  try {
    const signed = await fetchApi<SignPartsResponse>(
      `/drive/upload-sessions/${session.id}/parts`,
      {
        body: JSON.stringify({ partNumbers }),
        method: 'POST',
      },
      options.configDir
    );

    const completedParts: Array<{ etag: string; number: number }> = [];
    await uploadPartsSequentially({
      completedParts,
      filePath: options.filePath,
      onProgress: options.onProgress,
      partIndex: 0,
      partSize,
      signed,
      statsSize: stats.size,
      totalParts,
    });

    const completedNode = await fetchApi<Record<string, unknown>>(
      `/drive/upload-sessions/${session.id}/complete`,
      {
        body: JSON.stringify({ parts: completedParts }),
        method: 'POST',
      },
      options.configDir
    );

    return completedNode;
  } catch (error) {
    await fetchApi(`/drive/upload-sessions/${session.id}`, { method: 'DELETE' }, options.configDir).catch(
      () => {}
    );
    throw error;
  }
}
