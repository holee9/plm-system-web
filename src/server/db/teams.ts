import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Teams table - represents organizations or project groups
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  // URL-friendly unique identifier for team
  slug: text("slug").notNull().unique(),
  // Optional description
  description: text("description"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
