// PLM module - BOM (Bill of Materials)
// Placeholder for BOM implementation

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  revision: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BomItem {
  id: string;
  parentId: string | null; // null for root parts
  childId: string;
  quantity: number;
  unit: string;
}
