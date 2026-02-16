// Issue tRPC Router
import { z } from "zod";
import { router, publicProcedure } from "~/server/trpc";
import * as service from "./service";
import type { IssueStatus } from "./types";

// TODO: Replace with actual auth context once implemented
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

function getUserId(ctx: any): string {
  // For now, use a test user ID
  // TODO: Get from getUserId(ctx) once auth is implemented
  return TEST_USER_ID;
}

// Input schemas
const createIssueSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  milestoneId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

const updateIssueSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  milestoneId: z.string().uuid().nullable().optional(),
});

const issueStatusSchema: z.ZodType<IssueStatus> = z.enum([
  "open",
  "in_progress",
  "review",
  "done",
  "closed",
]);

const updateStatusSchema = z.object({
  status: issueStatusSchema,
});

const updatePositionSchema = z.object({
  status: issueStatusSchema,
  position: z.number().int().min(0),
});

const listIssuesSchema = z.object({
  status: issueStatusSchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  milestoneId: z.string().uuid().nullable().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
});

const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  description: z.string().max(255).optional(),
});

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
  description: z.string().max(255).nullable().optional(),
});

const assignLabelSchema = z.object({
  labelId: z.string().uuid(),
});

const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

// Export router
export const issueRouter = router({
  // Issue CRUD
  create: publicProcedure
    .input(createIssueSchema)
    .mutation(async ({ ctx, input }) => {
      return service.createIssue(input, getUserId(ctx));
    }),

  list: publicProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      filters: listIssuesSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      return service.listIssues(input.projectId, input.filters || {});
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return service.getIssueById(input.id);
    }),

  getByNumber: publicProcedure
    .input(z.object({
      projectKey: z.string(),
      number: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      return service.getIssueByProjectKeyNumber(input.projectKey, input.number);
    }),

  update: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateIssueSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssue(input.id, input.data, getUserId(ctx));
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssueStatus(input.id, input.data.status, getUserId(ctx));
    }),

  updatePosition: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePositionSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssuePosition(
        input.id,
        input.data.status,
        input.data.position,
        getUserId(ctx)
      );
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement delete with admin check
      throw new Error("Not implemented");
    }),

  // Comments
  comment: router({
    create: publicProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: createCommentSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.createIssueComment(input.issueId, input.data.content, getUserId(ctx));
      }),

    list: publicProcedure
      .input(z.object({ issueId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listIssueComments(input.issueId);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string().uuid(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update
        throw new Error("Not implemented");
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement delete
        throw new Error("Not implemented");
      }),
  }),

  // Labels
  label: router({
    create: publicProcedure
      .input(z.object({
        projectId: z.string().uuid(),
        data: createLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.createLabel(
          input.projectId,
          input.data.name,
          input.data.color,
          input.data.description,
          getUserId(ctx)
        );
      }),

    list: publicProcedure
      .input(z.object({ projectId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listLabels(input.projectId);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: updateLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update
        throw new Error("Not implemented");
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement delete
        throw new Error("Not implemented");
      }),

    assign: publicProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: assignLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.assignLabelToIssue(input.issueId, input.data.labelId, getUserId(ctx));
      }),

    unassign: publicProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: assignLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.unassignLabelFromIssue(input.issueId, input.data.labelId, getUserId(ctx));
      }),
  }),

  // Milestones
  milestone: router({
    create: publicProcedure
      .input(z.object({
        projectId: z.string().uuid(),
        data: createMilestoneSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.createMilestone(
          input.projectId,
          input.data.title,
          getUserId(ctx),
          input.data.description,
          input.data.dueDate
        );
      }),

    list: publicProcedure
      .input(z.object({ projectId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listMilestones(input.projectId);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: updateMilestoneSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update
        throw new Error("Not implemented");
      }),

    close: publicProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement close
        throw new Error("Not implemented");
      }),
  }),
});
