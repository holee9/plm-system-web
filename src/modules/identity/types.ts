/**
 * Shared types for identity module
 * These types are used across backend and frontend for type safety
 */

/**
 * Team member roles
 */
export type TeamRole = "owner" | "admin" | "member";

/**
 * Team information
 */
export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team with user's role
 */
export interface TeamWithRole extends Team {
  role: TeamRole;
  memberCount: number;
}

/**
 * Team member with user details
 */
export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  role: TeamRole;
  joinedAt: Date;
}

/**
 * Team details with members
 */
export interface TeamDetails extends Team {
  yourRole: TeamRole;
  members: TeamMember[];
  memberCount: number;
}

/**
 * Team creation input
 */
export interface CreateTeamInput {
  name: string;
  description?: string;
}

/**
 * Team update input
 */
export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

/**
 * Add member input
 */
export interface AddMemberInput {
  teamId: number;
  email: string;
  role: Exclude<TeamRole, "owner">;
}

/**
 * Update member role input
 */
export interface UpdateMemberRoleInput {
  teamId: number;
  userId: number;
  role: Exclude<TeamRole, "owner">;
}

/**
 * Remove member input
 */
export interface RemoveMemberInput {
  teamId: number;
  userId: number;
}
