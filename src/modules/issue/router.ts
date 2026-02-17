// Issue tRPC Router
import { z } from "zod";
import { router, protectedProcedure } from "~/server/trpc";
import * as service from "./service";
import * as labelService from "./label-service";
import * as attachmentService from "./attachment-service";
import type { IssueStatus } from "./types";

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

// Attachment schemas
const uploadAttachmentSchema = z.object({
  issueId: z.string().uuid(),
  originalFileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // Max 10MB
  mimeType: z.string(),
});

const listAttachmentsSchema = z.object({
  issueId: z.string().uuid(),
});

// Export router
export const issueRouter = router({
  // Issue CRUD
  create: protectedProcedure
    .input(createIssueSchema)
    .mutation(async ({ ctx, input }) => {
      return service.createIssue(input, ctx.user.id);
    }),

  list: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      filters: listIssuesSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      return service.listIssues(input.projectId, input.filters || {});
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return service.getIssueById(input.id);
    }),

  getByNumber: protectedProcedure
    .input(z.object({
      projectKey: z.string(),
      number: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      return service.getIssueByProjectKeyNumber(input.projectKey, input.number);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateIssueSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssue(input.id, input.data, ctx.user.id);
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updateStatusSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssueStatus(input.id, input.data.status, ctx.user.id);
    }),

  updatePosition: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePositionSchema }))
    .mutation(async ({ ctx, input }) => {
      return service.updateIssuePosition(
        input.id,
        input.data.status,
        input.data.position,
        ctx.user.id
      );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement delete with admin check
      throw new Error("Not implemented");
    }),

  // Comments
  comment: router({
    create: protectedProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: createCommentSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.createIssueComment(input.issueId, input.data.content, ctx.user.id);
      }),

    list: protectedProcedure
      .input(z.object({ issueId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listIssueComments(input.issueId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update
        throw new Error("Not implemented");
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement delete
        throw new Error("Not implemented");
      }),
  }),

  // Labels
  label: router({
    create: protectedProcedure
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
          ctx.user.id
        );
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listLabels(input.projectId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: updateLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return labelService.updateLabel(
          input.id,
          input.data,
          ctx.user.id
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await labelService.deleteLabel(input.id, ctx.user.id);
        return { success: true };
      }),

    assign: protectedProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: assignLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.assignLabelToIssue(input.issueId, input.data.labelId, ctx.user.id);
      }),

    unassign: protectedProcedure
      .input(z.object({
        issueId: z.string().uuid(),
        data: assignLabelSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.unassignLabelFromIssue(input.issueId, input.data.labelId, ctx.user.id);
      }),
  }),

  // Milestones
  milestone: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.string().uuid(),
        data: createMilestoneSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        return service.createMilestone(
          input.projectId,
          input.data.title,
          ctx.user.id,
          input.data.description,
          input.data.dueDate
        );
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return service.listMilestones(input.projectId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        data: updateMilestoneSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement update
        throw new Error("Not implemented");
      }),

    close: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement close
        throw new Error("Not implemented");
      }),
  }),

  // Milestone progress
  getMilestoneProgress: protectedProcedure
    .input(z.object({ milestoneId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return service.calculateMilestoneProgress(input.milestoneId);
    }),

  getProjectMilestonesProgress: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return service.getMilestonesProgress(input.projectId);
    }),

  // Attachments
  attachment: router({
    upload: protectedProcedure
      .input(uploadAttachmentSchema)
      .mutation(async ({ ctx, input }) => {
        return attachmentService.uploadAttachment(
          input.issueId,
          input.originalFileName,
          input.fileSize,
          input.mimeType,
          ctx.user.id
        );
      }),

    list: protectedProcedure
      .input(listAttachmentsSchema)
      .query(async ({ ctx, input }) => {
        return attachmentService.listAttachments(input.issueId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        return attachmentService.getAttachmentById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await attachmentService.deleteAttachment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});
