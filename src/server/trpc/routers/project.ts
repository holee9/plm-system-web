// Project tRPC Router
import { z } from "zod";
import {
  router as createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../procedures";
import {
  createProject,
  getProjectById,
  getProjectByKey,
  listUserProjects,
  updateProject,
  archiveProject,
  restoreProject,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
  listProjectMembers,
  ProjectValidationError,
  ProjectAccessError,
  ProjectNotFoundError,
} from "~/modules/project/service";

// Zod schemas
const createProjectInput = z.object({
  name: z.string().min(2).max(255),
  key: z.string().regex(/^[A-Z0-9]{2,10}$/, {
    message: "Project key must be 2-10 uppercase letters and numbers",
  }),
  description: z.string().optional(),
  teamId: z.string().uuid().optional(),
});

const updateProjectInput = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

const addMemberInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

const removeMemberInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
});

const updateMemberRoleInput = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "member", "viewer"]),
});

export const projectRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(createProjectInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await createProject(
          {
            name: input.name,
            key: input.key,
            description: input.description,
            teamId: input.teamId,
            createdBy: ctx.user.id,
          },
          ctx.user.id
        );

        return {
          success: true,
          data: project,
        };
      } catch (error) {
        if (error instanceof ProjectValidationError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to create project");
      }
    }),

  // List current user's projects
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "archived"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await listUserProjects({
        userId: ctx.user.id,
        status: input.status,
        limit: input.limit,
        offset: input.offset,
      });

      return result;
    }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const project = await getProjectById(input.id, ctx.user.id);
        if (!project) {
          throw new Error("Project not found");
        }
        return project;
      } catch (error) {
        if (error instanceof ProjectAccessError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to get project");
      }
    }),

  // Get project by key
  getByKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const project = await getProjectByKey(input.key, ctx.user.id);
        if (!project) {
          throw new Error("Project not found");
        }
        return project;
      } catch (error) {
        if (error instanceof ProjectAccessError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to get project");
      }
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        data: updateProjectInput,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await updateProject(
          input.projectId,
          ctx.user.id,
          input.data
        );

        return {
          success: true,
          data: project,
        };
      } catch (error) {
        if (error instanceof ProjectAccessError || error instanceof ProjectValidationError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to update project");
      }
    }),

  // Archive project
  archive: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await archiveProject(input.projectId, ctx.user.id);

        return {
          success: true,
          data: project,
        };
      } catch (error) {
        if (error instanceof ProjectAccessError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to archive project");
      }
    }),

  // Restore archived project
  restore: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await restoreProject(input.projectId, ctx.user.id);

        return {
          success: true,
          data: project,
        };
      } catch (error) {
        if (error instanceof ProjectAccessError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to restore project");
      }
    }),

  // Add member to project
  addMember: protectedProcedure
    .input(addMemberInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const member = await addProjectMember(
          input.projectId,
          ctx.user.id,
          input.userId,
          input.role,
          ctx.user.id
        );

        return {
          success: true,
          data: member,
        };
      } catch (error) {
        if (
          error instanceof ProjectAccessError ||
          error instanceof ProjectValidationError
        ) {
          throw new Error(error.message);
        }
        throw new Error("Failed to add member");
      }
    }),

  // Remove member from project
  removeMember: protectedProcedure
    .input(removeMemberInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await removeProjectMember(
          input.projectId,
          input.userId,
          ctx.user.id
        );

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof ProjectAccessError || error instanceof ProjectValidationError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to remove member");
      }
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(updateMemberRoleInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const member = await updateMemberRole(
          input.projectId,
          input.userId,
          input.role,
          ctx.user.id
        );

        return {
          success: true,
          data: member,
        };
      } catch (error) {
        if (error instanceof ProjectAccessError || error instanceof ProjectValidationError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to update member role");
      }
    }),

  // List project members
  listMembers: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const members = await listProjectMembers(
          input.projectId,
          ctx.user.id
        );

        return members;
      } catch (error) {
        if (error instanceof ProjectAccessError) {
          throw new Error(error.message);
        }
        throw new Error("Failed to list members");
      }
    }),
});
