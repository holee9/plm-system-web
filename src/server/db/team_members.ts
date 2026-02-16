import { pgEnum, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { users } from "./users";

// Team member role enum
export const teamRoleEnum = pgEnum("team_role", ["owner", "admin", "member"]);

// Team members table - junction table for users and teams
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: serial("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: serial("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Role determines permission level within the team
  role: teamRoleEnum("role").default("member").notNull(),
  // Timestamp when user joined the team
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
