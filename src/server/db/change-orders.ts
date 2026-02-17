/**
 * Change Orders database schema
 * Defines tables for Engineering Change Requests (ECR) and Engineering Change Notices (ECN)
 */
import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

// ============================================================================
// Enums
// ============================================================================

export const changeOrderTypeEnum = pgEnum("change_order_type", ["ECR", "ECN"]);

export const changeOrderStatusEnum = pgEnum("change_order_status", [
  "draft",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "implemented",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const changeOrderPriorityEnum = pgEnum("change_order_priority", [
  "urgent",
  "high",
  "medium",
  "low",
]);

// ============================================================================
// Change Orders Table
// ============================================================================

/**
 * Change Orders table - stores ECR and ECN records
 */
export const changeOrders = pgTable("change_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: changeOrderTypeEnum("type").notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  reason: text("reason").notNull(),
  priority: changeOrderPriorityEnum("priority").default("medium").notNull(),
  status: changeOrderStatusEnum("status").default("draft").notNull(),
  requesterId: uuid("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  implementedAt: timestamp("implemented_at"),
  implementedRevisionId: uuid("implemented_revision_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectTypeNumberIdx: sql`UNIQUE(table.project_id, table.type, table.number)`,
  typeNumberIdx: sql`CREATE INDEX IF NOT EXISTS change_orders_type_number_idx ON change_orders(type, number)`,
  statusIdx: sql`CREATE INDEX IF NOT EXISTS change_orders_status_idx ON change_orders(status)`,
  projectIdx: sql`CREATE INDEX IF NOT EXISTS change_orders_project_id_idx ON change_orders(project_id)`,
  requesterIdx: sql`CREATE INDEX IF NOT EXISTS change_orders_requester_id_idx ON change_orders(requester_id)`,
}));

// ============================================================================
// Change Order Approvers Table
// ============================================================================

export const changeOrderApprovers = pgTable("change_order_approvers", {
  id: uuid("id").defaultRandom().primaryKey(),
  changeOrderId: uuid("change_order_id")
    .notNull()
    .references(() => changeOrders.id, { onDelete: "cascade" }),
  approverId: uuid("approver_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: approvalStatusEnum("status").default("pending").notNull(),
  comment: text("comment"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueChangeOrderApprover: sql`UNIQUE(table.change_order_id, table.approver_id)`,
  changeOrderIdx: sql`CREATE INDEX IF NOT EXISTS change_order_approvers_change_order_id_idx ON change_order_approvers(change_order_id)`,
  approverIdx: sql`CREATE INDEX IF NOT EXISTS change_order_approvers_approver_id_idx ON change_order_approvers(approver_id)`,
}));

// ============================================================================
// Change Order Audit Trail Table
// ============================================================================

export const changeOrderAuditTrail = pgTable("change_order_audit_trail", {
  id: uuid("id").defaultRandom().primaryKey(),
  changeOrderId: uuid("change_order_id")
    .notNull()
    .references(() => changeOrders.id, { onDelete: "cascade" }),
  fromStatus: changeOrderStatusEnum("from_status").notNull(),
  toStatus: changeOrderStatusEnum("to_status").notNull(),
  changedBy: uuid("changed_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  comment: text("comment"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  changeOrderIdx: sql`CREATE INDEX IF NOT EXISTS change_order_audit_trail_change_order_id_idx ON change_order_audit_trail(change_order_id)`,
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS change_order_audit_trail_created_at_idx ON change_order_audit_trail(created_at)`,
}));

// ============================================================================
// Change Order Affected Parts Table
// ============================================================================

export const changeOrderAffectedParts = pgTable("change_order_affected_parts", {
  id: uuid("id").defaultRandom().primaryKey(),
  changeOrderId: uuid("change_order_id")
    .notNull()
    .references(() => changeOrders.id, { onDelete: "cascade" }),
  partId: uuid("part_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  impactDescription: text("impact_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueChangeOrderPart: sql`UNIQUE(table.change_order_id, table.part_id)`,
  changeOrderIdx: sql`CREATE INDEX IF NOT EXISTS change_order_affected_parts_change_order_id_idx ON change_order_affected_parts(change_order_id)`,
  partIdx: sql`CREATE INDEX IF NOT EXISTS change_order_affected_parts_part_id_idx ON change_order_affected_parts(part_id)`,
}));

// ============================================================================
// Type Inference
// ============================================================================

export type ChangeOrder = typeof changeOrders.$inferSelect;
export type NewChangeOrder = typeof changeOrders.$inferInsert;

export type ChangeOrderApprover = typeof changeOrderApprovers.$inferSelect;
export type NewChangeOrderApprover = typeof changeOrderApprovers.$inferInsert;

export type ChangeOrderAuditTrail = typeof changeOrderAuditTrail.$inferSelect;
export type NewChangeOrderAuditTrail = typeof changeOrderAuditTrail.$inferInsert;

export type ChangeOrderAffectedPart = typeof changeOrderAffectedParts.$inferSelect;
export type NewChangeOrderAffectedPart = typeof changeOrderAffectedParts.$inferInsert;
