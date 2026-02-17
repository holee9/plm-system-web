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
export * from "../../modules/issue/schemas/issues";
export * from "../../modules/issue/schemas/issue-comments";
export * from "../../modules/issue/schemas/labels";
export * from "../../modules/issue/schemas/issue-labels";
export * from "../../modules/issue/schemas/milestones";
export * from "../../modules/issue/schemas/issue-attachments";

// Notification module tables
export * from "../../modules/notification/schemas";

// PLM tables
export * from "./parts";
export * from "./revisions";
export * from "./bom_items";
export * from "./manufacturers";

// Change Order tables
export * from "./change-orders";

// Documents/Files tables
export * from "./documents";
