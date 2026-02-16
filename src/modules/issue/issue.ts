// Issue module - Issue entity
// Placeholder for issue implementation

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';

export interface Issue {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  authorId: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
