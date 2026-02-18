/**
 * Change Order Export Utilities
 * Handles CSV and PDF export for change orders with field selection
 */

import { ChangeOrderWithDetails } from "./change-order-service";

// ============================================================================
// Type Definitions
// ============================================================================

export type ExportFormat = "csv" | "pdf";
export type ExportField =
  | "id"
  | "type"
  | "number"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "requester"
  | "project"
  | "createdAt"
  | "updatedAt"
  | "approvers"
  | "approvalProgress";

export interface ExportOptions {
  format: ExportFormat;
  fields: ExportField[];
  includeHeader?: boolean;
  filename?: string;
}

export interface ExportFieldConfig {
  key: ExportField;
  label: string;
  default: boolean;
  formatter?: (value: any, item: ChangeOrderWithDetails) => string;
}

// ============================================================================
// Field Configuration
// ============================================================================

const FIELD_CONFIGS: ExportFieldConfig[] = [
  {
    key: "id",
    label: "ID",
    default: true,
  },
  {
    key: "type",
    label: "Type",
    default: true,
  },
  {
    key: "number",
    label: "Number",
    default: true,
  },
  {
    key: "title",
    label: "Title",
    default: true,
  },
  {
    key: "description",
    label: "Description",
    default: false,
    formatter: (value: string | null) => value ?? "",
  },
  {
    key: "status",
    label: "Status",
    default: true,
  },
  {
    key: "priority",
    label: "Priority",
    default: true,
    formatter: (value: string | null) => value ?? "-",
  },
  {
    key: "requester",
    label: "Requester",
    default: true,
    formatter: (_: any, item: ChangeOrderWithDetails) => item.requesterName || "Unknown",
  },
  {
    key: "project",
    label: "Project",
    default: false,
    formatter: (_: any, item: ChangeOrderWithDetails) => item.projectName || "",
  },
  {
    key: "createdAt",
    label: "Created At",
    default: true,
    formatter: (value: Date) => new Date(value).toLocaleString("ko-KR"),
  },
  {
    key: "updatedAt",
    label: "Updated At",
    default: false,
    formatter: (value: Date) => new Date(value).toLocaleString("ko-KR"),
  },
  {
    key: "approvers",
    label: "Approvers",
    default: false,
    formatter: (_: any, item: ChangeOrderWithDetails) => {
      if (!item.approvers || item.approvers.length === 0) return "-";
      return item.approvers.map((a) => `${a.approverId} (${a.status})`).join("; ");
    },
  },
  {
    key: "approvalProgress",
    label: "Approval Progress",
    default: true,
    formatter: (_: any, item: ChangeOrderWithDetails) => {
      if (!item.approvalProgress) return "-";
      const { total, approved, rejected, pending } = item.approvalProgress;
      return `${approved}/${total} approved, ${rejected} rejected, ${pending} pending`;
    },
  },
];

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Get default export fields
 */
export function getDefaultExportFields(): ExportField[] {
  return FIELD_CONFIGS.filter((f) => f.default).map((f) => f.key);
}

/**
 * Get all available export field configurations
 */
export function getExportFieldConfigs(): ExportFieldConfig[] {
  return FIELD_CONFIGS;
}

/**
 * Extract field value from change order based on field key
 */
function getFieldValue(
  item: ChangeOrderWithDetails,
  field: ExportField
): string {
  const config = FIELD_CONFIGS.find((f) => f.key === field);
  if (!config) return "";

  const formatter = config.formatter || ((value: any) => (value == null ? "" : String(value)));

  // Map field key to item property
  const valueMap: Record<ExportField, any> = {
    id: item.id,
    type: item.type,
    number: item.number,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    requester: item.requesterName,
    project: item.projectName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    approvers: item.approvers,
    approvalProgress: item.approvalProgress,
  };

  return formatter(valueMap[field], item);
}

/**
 * Generate CSV content from change orders
 */
export function generateCsvContent(
  items: ChangeOrderWithDetails[],
  options: ExportOptions
): string {
  const selectedConfigs = FIELD_CONFIGS.filter((f) =>
    options.fields.includes(f.key)
  );

  // Generate header
  const header = options.includeHeader !== false
    ? selectedConfigs.map((f) => f.label).join(",")
    : "";

  // Generate rows
  const rows = items.map((item) =>
    selectedConfigs.map((config) => {
      const value = getFieldValue(item, config.key);
      // Escape CSV values
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Generate default filename for export
 */
export function generateExportFilename(format: ExportFormat, prefix: string = "change-orders"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}-${date}.${format}`;
}

/**
 * Prepare data for PDF export
 * Returns array of arrays (rows and columns)
 */
export function preparePdfData(
  items: ChangeOrderWithDetails[],
  options: ExportOptions
): {
  headers: string[];
  rows: string[][];
} {
  const selectedConfigs = FIELD_CONFIGS.filter((f) =>
    options.fields.includes(f.key)
  );

  const headers = selectedConfigs.map((f) => f.label);
  const rows = items.map((item) =>
    selectedConfigs.map((config) => getFieldValue(item, config.key))
  );

  return { headers, rows };
}

/**
 * Export change orders as CSV (browser-compatible)
 */
export async function exportChangeOrdersAsCsvBrowser(
  items: ChangeOrderWithDetails[],
  options: ExportOptions
): Promise<void> {
  const csv = generateCsvContent(items, options);
  const filename = options.filename || generateExportFilename("csv");

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export change orders as PDF (browser-compatible)
 * Requires jsPDF and jspdf-autotable to be loaded
 */
export async function exportChangeOrdersAsPdfBrowser(
  items: ChangeOrderWithDetails[],
  options: ExportOptions
): Promise<void> {
  // Dynamic import of jsPDF
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const { headers, rows } = preparePdfData(items, options);
  const filename = options.filename || generateExportFilename("pdf");

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text("Change Orders", 14, 20);

  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString("ko-KR")}`, 14, 28);

  // Add table using autoTable
  (doc as any).autoTable({
    startY: 35,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 35, left: 14, right: 14, bottom: 14 },
  });

  // Save the PDF
  doc.save(filename);
}

/**
 * Main export function that routes to appropriate format
 */
export async function exportChangeOrders(
  items: ChangeOrderWithDetails[],
  options: ExportOptions
): Promise<void> {
  switch (options.format) {
    case "csv":
      await exportChangeOrdersAsCsvBrowser(items, options);
      break;
    case "pdf":
      await exportChangeOrdersAsPdfBrowser(items, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): void {
  if (!["csv", "pdf"].includes(options.format)) {
    throw new Error('Format must be "csv" or "pdf"');
  }

  if (!options.fields || options.fields.length === 0) {
    throw new Error("At least one field must be selected for export");
  }

  const validFields = FIELD_CONFIGS.map((f) => f.key);
  const invalidFields = options.fields.filter((f) => !validFields.includes(f));

  if (invalidFields.length > 0) {
    throw new Error(`Invalid export fields: ${invalidFields.join(", ")}`);
  }
}

/**
 * Get export statistics
 */
export function getExportStats(items: ChangeOrderWithDetails[]): {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const stats = {
    total: items.length,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  for (const item of items) {
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
  }

  return stats;
}
