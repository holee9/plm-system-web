// Document module - Document Version
// Placeholder for document version implementation

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  filePath: string;
  fileSize: number;
  uploaderId: string;
  changelog: string | null;
  createdAt: Date;
}
