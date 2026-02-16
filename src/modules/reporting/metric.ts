// Reporting module - Metric
// Placeholder for metric implementation

export interface Metric {
  id: string;
  name: string;
  description: string | null;
  type: 'counter' | 'gauge' | 'histogram';
  query: string; // SQL or aggregation query
  unit: string | null;
}
