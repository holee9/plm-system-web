// Project module - Task
// Placeholder for task implementation

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  assigneeId: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
