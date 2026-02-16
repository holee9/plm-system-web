// Document module - Document Template
// Placeholder for document template implementation

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  templatePath: string;
  createdAt: Date;
  updatedAt: Date;
}
