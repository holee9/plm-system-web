/**
 * User Dashboards Table
 * Custom user dashboard configurations with widget layouts
 */
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

/**
 * Widget definition type
 * Each widget has a type, position, size, and configuration
 */
export interface Widget {
  id: string;
  type: "stat" | "chart" | "list" | "table" | "custom";
  position: {
    x: number; // Column position (0-11 for 12-column grid)
    y: number; // Row position
  };
  size: {
    w: number; // Width in columns (1-12)
    h: number; // Height in rows
  };
  config: Record<string, any>; // Widget-specific configuration
}

/**
 * Dashboard layout type
 * Grid-based layout with widgets positioned on a virtual canvas
 */
export interface DashboardLayout {
  columns: number; // Number of columns (default: 12)
  rows: number; // Number of rows (auto-grow)
  widgets: Widget[];
}

export const userDashboards = pgTable("user_dashboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  layout: jsonb("layout").$type<DashboardLayout>().notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserDashboard = typeof userDashboards.$inferSelect;
export type NewUserDashboard = typeof userDashboards.$inferInsert;
