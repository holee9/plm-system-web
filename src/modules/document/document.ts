// Document module - Document entity
// Placeholder for document implementation

export interface Document {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploaderId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
