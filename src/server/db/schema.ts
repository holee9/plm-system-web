// Schema barrel export
// All table definitions will be exported from here

// Core tables
export * from "./users";
export * from "./sessions";
export * from "./roles";
export * from "./auth_events";

// Token tables
export * from "./email_verification_tokens";
export * from "./password_reset_tokens";

// Team tables
export * from "./teams";
export * from "./team_members";

// Project tables
export * from "./projects";
export * from "./project_members";

// Issue module tables (includes milestones)
export * from "../../modules/issue/schemas";

// Notification module tables
export * from "../../modules/notification/schemas";

// PLM tables
export * from "./parts";
export * from "./revisions";
export * from "./bom_items";
export * from "./manufacturers";
