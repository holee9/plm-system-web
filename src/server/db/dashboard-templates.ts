/**
 * Dashboard Templates Table
 * Reusable dashboard templates for quick setup
 */
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import type { DashboardLayout } from "./user-dashboards";

export const dashboardTemplates = pgTable("dashboard_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  layout: jsonb("layout").$type<DashboardLayout>().notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  category: varchar("category", { length: 100 }), // e.g., "project-management", "plm", "custom"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DashboardTemplate = typeof dashboardTemplates.$inferSelect;
export type NewDashboardTemplate = typeof dashboardTemplates.$inferInsert;
