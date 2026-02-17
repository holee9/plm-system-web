// Document module - Document Version
// Placeholder for document version implementation

export interface DocumentVersionRecord {
  id: string;
  documentId: string;
  version: string;
  filePath: string;
  fileSize: number;
  uploaderId: string;
  changelog: string | null;
  createdAt: Date;
}
