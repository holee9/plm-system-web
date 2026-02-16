// Reporting module - Report entity
// Placeholder for report implementation

export interface Report {
  id: string;
  name: string;
  description: string | null;
  type: 'project' | 'issue' | 'plm' | 'custom';
  config: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
