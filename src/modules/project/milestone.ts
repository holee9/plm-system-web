// Project module - Milestone
// Placeholder for milestone implementation

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  dueDate: Date | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
