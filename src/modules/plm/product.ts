// PLM module - Product entity
// Placeholder for product implementation

export interface Product {
  id: string;
  name: string;
  description: string | null;
  version: string;
  status: 'draft' | 'active' | 'deprecated' | 'retired';
  createdAt: Date;
  updatedAt: Date;
}
