// Team router - Protected procedures for team management
// Handles: create, list, getById, update, addMember, removeMember, updateMemberRole

import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { teamMembers, teams, users } from "../../db/schema";
import { protectedProcedure, router } from "../procedures";
import type { AuthenticatedContext } from "../middleware";

// Helper function to check if user has required role in team
async function checkTeamRole(
  db: AuthenticatedContext["db"],
  userId: number,
  teamId: number,
  allowedRoles: string[]
): Promise<boolean> {
  const membership = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  if (membership.length === 0) {
    return false;
  }

  return allowedRoles.includes(membership[0].role);
}

// Helper function to check if user is team owner
async function isTeamOwner(
  db: AuthenticatedContext["db"],
  userId: number,
  teamId: number
): Promise<boolean> {
  return checkTeamRole(db, userId, teamId, ["owner"]);
}

// Helper function to check if user is team owner or admin
async function isTeamOwnerOrAdmin(
  db: AuthenticatedContext["db"],
  userId: number,
  teamId: number
): Promise<boolean> {
  return checkTeamRole(db, userId, teamId, ["owner", "admin"]);
}

// Helper function to generate unique slug from team name
async function generateUniqueSlug(db: AuthenticatedContext["db"], name: string): Promise<string> {
  // Base slug: lowercase, replace spaces with hyphens, remove special chars
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");

  // Check if slug exists
  const existing = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1);

  // If slug exists, append random suffix
  if (existing.length > 0) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
  }

  return slug;
}

export const teamRouter = router({
  /**
   * Create a new team
   * Creates team with creator as owner
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "팀 이름은 최소 2자 이상이어야 합니다").max(100),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { name, description } = input;

      // Check if user already has a team with same name
      const existingTeam = await db
        .select()
        .from(teams)
        .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        .where(and(eq(teamMembers.userId, user.id), eq(teams.name, name)))
        .limit(1);

      if (existingTeam.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 동일한 이름의 팀이 존재합니다",
        });
      }

      // Generate unique slug
      const slug = await generateUniqueSlug(db, name);

      // Create team
      const newTeam = await db
        .insert(teams)
        .values({
          name,
          slug,
          description: description || null,
        })
        .returning();

      const team = newTeam[0];

      // Add creator as owner
      await db.insert(teamMembers).values({
        teamId: team.id,
        userId: user.id,
        role: "owner",
      });

      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        role: "owner" as const,
        memberCount: 1,
        createdAt: team.createdAt,
      };
    }),

  /**
   * List all teams for current user
   * Returns teams with user's role in each
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx as AuthenticatedContext;

    // Get all teams where user is a member
    const userTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        slug: teams.slug,
        description: teams.description,
        role: teamMembers.role,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, user.id))
      .orderBy(desc(teams.createdAt));

    // Get member count for each team separately
    const teamsWithCounts = await Promise.all(
      userTeams.map(async (team) => {
        const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));
        return {
          ...team,
          memberCount: members.length,
        };
      })
    );

    return {
      teams: teamsWithCounts.map((team) => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        role: team.role,
        memberCount: team.memberCount,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      })),
      count: userTeams.length,
    };
  }),

  /**
   * Get team by ID
   * Returns team details with member list if user is a member
   */
  getById: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { teamId } = input;

      // Check if user is a member of the team
      const membership = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, teamId)))
        .limit(1);

      if (membership.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "팀을 찾을 수 없거나 접근 권한이 없습니다",
        });
      }

      // Get team details
      const teamResult = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
      const team = teamResult[0];

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "팀을 찾을 수 없습니다",
        });
      }

      // Get all members with user details
      const members = await db
        .select({
          id: teamMembers.id,
          userId: teamMembers.userId,
          userName: users.name,
          userEmail: users.email,
          userImage: users.image,
          role: teamMembers.role,
          joinedAt: teamMembers.joinedAt,
        })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(eq(teamMembers.teamId, teamId))
        .orderBy(teamMembers.joinedAt);

      return {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        yourRole: membership[0].role,
        members: members.map((member) => ({
          id: member.id,
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail,
          userImage: member.userImage,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
        memberCount: members.length,
      };
    }),

  /**
   * Update team details
   * Only accessible to team owner or admin
   */
  update: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        name: z.string().min(2).max(100).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { teamId, name, description } = input;

      // Check if user is owner or admin
      const hasAccess = await isTeamOwnerOrAdmin(db, user.id, teamId);
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "팀을 수정할 권한이 없습니다",
        });
      }

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      updateData.updatedAt = new Date();

      // If name is being updated, regenerate slug
      if (name !== undefined) {
        updateData.slug = await generateUniqueSlug(db, name);
      }

      // Update team
      const updatedTeam = await db
        .update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId))
        .returning();

      return {
        success: true,
        message: "팀 정보가 업데이트되었습니다",
        team: updatedTeam[0],
      };
    }),

  /**
   * Add member to team
   * Only accessible to team owner or admin
   */
  addMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        email: z.string().email("올바른 이메일 주소를 입력해주세요"),
        role: z.enum(["admin", "member"]).default("member"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { teamId, email, role } = input;

      // Check if user is owner or admin
      const hasAccess = await isTeamOwnerOrAdmin(db, user.id, teamId);
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "멤버를 추가할 권한이 없습니다",
        });
      }

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const targetUser = userResult[0];

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 이메일을 가진 사용자를 찾을 수 없습니다",
        });
      }

      // Check if user is already a member
      const existingMember = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, targetUser.id)))
        .limit(1);

      if (existingMember.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 팀에 속해 있는 사용자입니다",
        });
      }

      // Add member to team
      await db.insert(teamMembers).values({
        teamId,
        userId: targetUser.id,
        role,
      });

      return {
        success: true,
        message: "멤버가 추가되었습니다",
        member: {
          userId: targetUser.id,
          userName: targetUser.name,
          userEmail: targetUser.email,
          role,
        },
      };
    }),

  /**
   * Remove member from team
   * Only accessible to team owner or admin
   * Owner cannot remove themselves (must transfer ownership first)
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { teamId, userId } = input;

      // Check if user is owner or admin
      const hasAccess = await isTeamOwnerOrAdmin(db, user.id, teamId);
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "멤버를 제거할 권한이 없습니다",
        });
      }

      // Prevent owner from removing themselves
      if (user.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "소유자는 팀에서 나갈 수 없습니다. 소유권을 이전한 후 나가주세요.",
        });
      }

      // Check if target user is owner
      const targetMembership = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        .limit(1);

      if (targetMembership.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 멤버를 찾을 수 없습니다",
        });
      }

      if (targetMembership[0].role === "owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "소유자를 제거할 수 없습니다. 소유권을 이전한 후 제거해주세요.",
        });
      }

      // Remove member
      await db
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

      return {
        success: true,
        message: "멤버가 제거되었습니다",
      };
    }),

  /**
   * Update member role
   * Only accessible to team owner
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx as AuthenticatedContext;
      const { teamId, userId, role } = input;

      // Check if current user is owner
      const isOwner = await isTeamOwner(db, user.id, teamId);
      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "역할을 변경할 권한이 없습니다",
        });
      }

      // Prevent owner from changing their own role
      if (user.id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "자신의 역할을 변경할 수 없습니다",
        });
      }

      // Check if target user is a member
      const targetMembership = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        .limit(1);

      if (targetMembership.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "해당 멤버를 찾을 수 없습니다",
        });
      }

      if (targetMembership[0].role === "owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "소유자의 역할을 변경할 수 없습니다",
        });
      }

      // Update role
      await db
        .update(teamMembers)
        .set({ role })
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

      return {
        success: true,
        message: "역할이 변경되었습니다",
        newRole: role,
      };
    }),
});
