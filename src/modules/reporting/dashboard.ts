// Reporting module - Dashboard
// Placeholder for dashboard implementation

export interface DashboardConfig {
  id: string;
  name: string;
  userId: string;
  layout: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'table';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
}
