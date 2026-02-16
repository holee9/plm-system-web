// Issue module - Issue Label
// Placeholder for issue label implementation

export interface Label {
  id: string;
  name: string;
  color: string; // Hex color code
  description: string | null;
}

export interface IssueLabel {
  issueId: string;
  labelId: string;
}
