/**
 * Document Service
 * Business logic for file upload, download, and version management
 */
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "~/server/db";
import {
  documents,
  type Document,
  type NewDocument,
} from "~/server/db/documents";
import { users } from "~/server/db/users";

// ============================================================================
// Type Definitions
// ============================================================================

export type ResourceType = "issue" | "part" | "change_order" | "project" | "milestone";

export interface UploadDocumentInput {
  resourceId: string;
  resourceType: ResourceType;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  description?: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  originalFileName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: Date;
  isLatest: boolean;
}

export interface DocumentWithVersions extends Document {
  uploaderName?: string;
  versions?: DocumentVersion[];
  totalVersions?: number;
}

// ============================================================================
// Validation Constants
// ============================================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
];

// ============================================================================
// Validation Functions
// ============================================================================

function validateFileSize(fileSize: number): void {
  if (fileSize <= 0) {
    throw new Error("File size must be positive");
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
}

function validateMimeType(mimeType: string): void {
  // Allow all MIME types for flexibility, but warn about potentially unsafe types
  const unsafeTypes = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
  ];

  if (unsafeTypes.some((t) => mimeType.toLowerCase().includes(t))) {
    throw new Error("Unsafe file type not allowed");
  }
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Generate unique filename for storage
 */
function generateStorageFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalFileName.split(".").pop() || "";
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Get next version number for resource
 */
async function getNextVersion(
  resourceId: string,
  resourceType: string
): Promise<number> {
  const [result] = await db
    .select({ maxVersion: sql<number>`MAX(version)` })
    .from(documents)
    .where(
      and(
        eq(documents.resourceId, resourceId),
        eq(documents.resourceType, resourceType)
      )
    );

  return (result?.maxVersion || 0) + 1;
}

/**
 * Upload/attach document to resource
 */
export async function uploadDocument(
  input: UploadDocumentInput
): Promise<DocumentWithVersions> {
  // Validate file
  validateFileSize(input.fileSize);
  validateMimeType(input.mimeType);

  // Get next version number
  const version = await getNextVersion(input.resourceId, input.resourceType);

  // Generate storage filename
  const fileName = generateStorageFileName(input.originalFileName);

  // If this is not the first version, mark previous versions as not latest
  if (version > 1) {
    await db
      .update(documents)
      .set({ isLatest: false })
      .where(
        and(
          eq(documents.resourceId, input.resourceId),
          eq(documents.resourceType, input.resourceType),
          eq(documents.isLatest, true)
        )
      );
  }

  // Create document record
  const newDocument: NewDocument = {
    resourceId: input.resourceId,
    resourceType: input.resourceType,
    originalFileName: input.originalFileName,
    fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    storagePath: input.storagePath,
    version,
    isLatest: true,
    uploadedBy: input.uploadedBy,
    description: input.description || null,
  };

  const [created] = await db.insert(documents).values(newDocument).returning();

  // Get uploader name
  const [uploader] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, input.uploadedBy))
    .limit(1);

  return {
    ...created,
    uploaderName: uploader?.name,
    totalVersions: version,
  };
}

/**
 * Get document by ID
 */
export async function getDocumentById(documentId: string): Promise<DocumentWithVersions | null> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    return null;
  }

  // Get uploader name
  const [uploader] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, document.uploadedBy))
    .limit(1);

  return {
    ...document,
    uploaderName: uploader?.name,
  };
}

/**
 * List documents for a resource
 */
export async function listDocumentsForResource(
  resourceId: string,
  resourceType: ResourceType
): Promise<DocumentWithVersions[]> {
  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.resourceId, resourceId),
        eq(documents.resourceType, resourceType),
        eq(documents.isLatest, true) // Only return latest versions by default
      )
    )
    .orderBy(desc(documents.createdAt));

  // Get uploader names for all documents
  const uploaderIds = [...new Set(docs.map((d) => d.uploadedBy))];
  const uploaders = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(sql`${users.id} = ANY(${uploaderIds})`);

  const uploaderMap = new Map(uploaders.map((u) => [u.id, u.name]));

  return docs.map((doc) => ({
    ...doc,
    uploaderName: uploaderMap.get(doc.uploadedBy),
  }));
}

/**
 * Get all versions of a document (by original file name pattern)
 */
export async function getDocumentVersions(
  resourceId: string,
  resourceType: ResourceType,
  originalFileName: string
): Promise<DocumentVersion[]> {
  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.resourceId, resourceId),
        eq(documents.resourceType, resourceType),
        sql`${documents.originalFileName} LIKE ${originalFileName}`
      )
    )
    .orderBy(desc(documents.version));

  // Get uploader names
  const uploaderIds = [...new Set(docs.map((d) => d.uploadedBy))];
  const uploaders = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(sql`${users.id} = ANY(${uploaderIds})`);

  const uploaderMap = new Map(uploaders.map((u) => [u.id, u.name]));

  return docs.map((doc) => ({
    id: doc.id,
    version: doc.version,
    originalFileName: doc.originalFileName,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    uploadedBy: doc.uploadedBy,
    uploadedByName: uploaderMap.get(doc.uploadedBy),
    createdAt: doc.createdAt,
    isLatest: doc.isLatest,
  }));
}

/**
 * Get all documents for a resource including all versions
 */
export async function getAllDocumentsForResource(
  resourceId: string,
  resourceType: ResourceType
): Promise<DocumentWithVersions[]> {
  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.resourceId, resourceId),
        eq(documents.resourceType, resourceType)
      )
    )
    .orderBy(desc(documents.createdAt));

  // Get uploader names
  const uploaderIds = [...new Set(docs.map((d) => d.uploadedBy))];
  const uploaders = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(sql`${users.id} = ANY(${uploaderIds})`);

  const uploaderMap = new Map(uploaders.map((u) => [u.id, u.name]));

  // Group by original file name and count versions
  const versionCounts = new Map<string, number>();
  docs.forEach((doc) => {
    const key = doc.originalFileName;
    versionCounts.set(key, (versionCounts.get(key) || 0) + 1);
  });

  return docs.map((doc) => ({
    ...doc,
    uploaderName: uploaderMap.get(doc.uploadedBy),
    totalVersions: versionCounts.get(doc.originalFileName) || 1,
  }));
}

/**
 * Delete document
 */
export async function deleteDocument(
  documentId: string,
  userId: string
): Promise<void> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new Error("Document not found");
  }

  // Only uploader can delete
  if (document.uploadedBy !== userId) {
    throw new Error("Only the uploader can delete this document");
  }

  await db.delete(documents).where(eq(documents.id, documentId));

  // If this was the latest version, mark the previous version as latest
  if (document.isLatest) {
    const [previousVersion] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.resourceId, document.resourceId),
          eq(documents.resourceType, document.resourceType),
          eq(documents.originalFileName, document.originalFileName)
        )
      )
      .orderBy(desc(documents.version))
      .limit(1);

    if (previousVersion) {
      await db
        .update(documents)
        .set({ isLatest: true })
        .where(eq(documents.id, previousVersion.id));
    }
  }
}

/**
 * Get document download URL/path
 */
export async function getDocumentDownloadPath(
  documentId: string,
  userId: string
): Promise<string> {
  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  return document.storagePath;
}

/**
 * Update document description
 */
export async function updateDocumentDescription(
  documentId: string,
  description: string,
  userId: string
): Promise<DocumentWithVersions> {
  const [existing] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!existing) {
    throw new Error("Document not found");
  }

  // Only uploader can update
  if (existing.uploadedBy !== userId) {
    throw new Error("Only the uploader can update this document");
  }

  await db
    .update(documents)
    .set({ description })
    .where(eq(documents.id, documentId));

  return getDocumentById(documentId) as Promise<DocumentWithVersions>;
}
