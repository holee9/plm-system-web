// File storage utilities for issue attachments
import { mkdir, writeFile, unlink, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

// Upload directory configuration
const UPLOAD_BASE_DIR = "public/uploads";
const ATTACHMENTS_DIR = join(UPLOAD_BASE_DIR, "attachments");

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDirectory(): Promise<void> {
  if (!existsSync(ATTACHMENTS_DIR)) {
    await mkdir(ATTACHMENTS_DIR, { recursive: true });
  }
}

/**
 * Get full file path for an attachment
 */
export function getAttachmentFilePath(fileName: string): string {
  return join(ATTACHMENTS_DIR, fileName);
}

/**
 * Save uploaded file to disk
 */
export async function saveUploadedFile(
  fileName: string,
  fileData: Buffer | Uint8Array
): Promise<void> {
  await ensureUploadDirectory();
  const filePath = getAttachmentFilePath(fileName);
  await writeFile(filePath, fileData);
}

/**
 * Delete uploaded file from disk
 */
export async function deleteUploadedFile(fileName: string): Promise<void> {
  const filePath = getAttachmentFilePath(fileName);
  await unlink(filePath);
}

/**
 * Check if file exists
 */
export async function fileExists(fileName: string): Promise<boolean> {
  try {
    const filePath = getAttachmentFilePath(fileName);
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size
 */
export async function getFileSize(fileName: string): Promise<number> {
  const filePath = getAttachmentFilePath(fileName);
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Read file from disk
 * Returns file buffer for download
 */
export async function readUploadedFile(fileName: string): Promise<Buffer> {
  const filePath = getAttachmentFilePath(fileName);
  return readFile(filePath);
}
