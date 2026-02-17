import { z } from "zod";
import { eq, and, desc, asc, sql } from "drizzle-orm";

import { publicProcedure, router } from "../index";
import { issues, issueComments } from "../../db";

// Input schemas
const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).default("task"),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).default("none"),
  status: z.enum(["open", "in_progress", "review", "done", "closed"]).default("open"),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  projectId: z.string().uuid("Invalid project ID format"),
  labels: z.array(z.string()).optional(),
});

const updateIssueSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  status: z.enum(["open", "in_progress", "review", "done", "closed"]).optional(),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  projectId: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

const listIssuesSchema = z.object({
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["open", "in_progress", "review", "done", "closed"]).optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  onlyMyIssues: z.boolean().default(false),
  currentUserId: z.string().optional(),
});

const createCommentSchema = z.object({
  issueId: z.string(),
  content: z.string().min(1, "Comment is required"),
  authorId: z.string(),
});

export const issueRouter = router({
  // List issues with optional filters
  list: publicProcedure
    .input(listIssuesSchema.optional())
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.projectId) {
        conditions.push(eq(issues.projectId, input.projectId));
      }
      if (input?.assigneeId) {
        conditions.push(eq(issues.assigneeId, input.assigneeId));
      }
      if (input?.status) {
        conditions.push(eq(issues.status, input.status));
      }
      if (input?.priority) {
        conditions.push(eq(issues.priority, input.priority));
      }
      if (input?.type) {
        conditions.push(eq(issues.type, input.type));
      }
      if (input?.onlyMyIssues && input?.currentUserId) {
        conditions.push(eq(issues.assigneeId, input.currentUserId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await ctx.db
        .select()
        .from(issues)
        .where(whereClause)
        .orderBy(desc(issues.createdAt));

      return result;
    }),

  // Get single issue by id
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  // Get issue by project key and number (e.g., PLM-1)
  getByProjectKeyNumber: publicProcedure
    .input(z.object({
      projectKey: z.string(),
      number: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const key = `${input.projectKey}-${input.number}`;

      const result = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.key, key))
        .limit(1);

      return result[0] || null;
    }),

  // Get issue with comments
  getDetail: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const issueResult = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.id, input.id))
        .limit(1);

      const issue = issueResult[0];
      if (!issue) {
        return null;
      }

      const commentsResult = await ctx.db
        .select()
        .from(issueComments)
        .where(eq(issueComments.issueId, input.id))
        .orderBy(asc(issueComments.createdAt));

      return {
        issue,
        comments: commentsResult,
        activities: [], // TODO: Implement activities table
      };
    }),

  // Create new issue
  create: publicProcedure
    .input(createIssueSchema)
    .mutation(async ({ ctx, input }) => {
      // Generate issue key (e.g., ISS-001)
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(issues);

      const count = Number(countResult[0]?.count || 0);
      const number = count + 1;
      const key = `ISS-${String(number).padStart(3, "0")}`;

      const result = await ctx.db
        .insert(issues)
        .values({
          title: input.title,
          description: input.description,
          type: input.type,
          priority: input.priority,
          status: input.status,
          assigneeId: input.assigneeId ?? null,
          reporterId: input.reporterId ?? "", // Will fail validation if not provided
          projectId: input.projectId,
          number,
          key,
          position: 0,
        })
        .returning();

      return result[0];
    }),

  // Update issue
  update: publicProcedure
    .input(updateIssueSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Get existing issue for activity logging
      const existing = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.id, id))
        .limit(1);

      if (!existing[0]) {
        throw new Error("Issue not found");
      }

      // Update issue
      const result = await ctx.db
        .update(issues)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(issues.id, id))
        .returning();

      return result[0];
    }),

  // Delete issue
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(issues).where(eq(issues.id, input.id));
      return { success: true };
    }),

  // Add comment to issue
  addComment: publicProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(issueComments)
        .values(input)
        .returning();

      return result[0];
    }),

  // Get comments for issue
  getComments: publicProcedure
    .input(z.object({ issueId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(issueComments)
        .where(eq(issueComments.issueId, input.issueId))
        .orderBy(asc(issueComments.createdAt));

      return result;
    }),

  // List attachments for issue
  listAttachments: publicProcedure
    .input(z.object({ issueId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { listAttachments } = await import("~/modules/issue/attachment-service");
      return listAttachments(input.issueId);
    }),

  // Get download URL for attachment
  getAttachmentDownloadUrl: publicProcedure
    .input(z.object({ attachmentId: z.string().uuid() }))
    .query(async ({ input }) => {
      // Return signed URL or direct download endpoint path
      return {
        downloadUrl: `/api/attachments/${input.attachmentId}/download`,
      };
    }),

  // Upload attachment (metadata only - file upload handled by API route)
  uploadAttachment: publicProcedure
    .input(z.object({
      issueId: z.string().uuid(),
      fileName: z.string().min(1).max(255),
      fileSize: z.number().positive().max(50 * 1024 * 1024), // Max 50MB
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { uploadAttachment } = await import("~/modules/issue/attachment-service");

      // TODO: Get actual user ID from auth context
      const userId = "00000000-0000-0000-0000-000000000001";

      const attachment = await uploadAttachment(
        input.issueId,
        input.fileName,
        input.fileSize,
        input.mimeType,
        userId
      );

      return {
        attachment,
        // Client should use this URL to upload the actual file
        uploadUrl: `/api/issues/${input.issueId}/attachments`,
      };
    }),

  // Delete attachment
  deleteAttachment: publicProcedure
    .input(z.object({ attachmentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { deleteAttachment } = await import("~/modules/issue/attachment-service");

      // TODO: Get actual user ID from auth context
      const userId = "00000000-0000-0000-0000-000000000001";

      await deleteAttachment(input.attachmentId, userId);

      return { success: true };
    }),

  // TODO: Implement activities table
  // getActivities: publicProcedure
  //   .input(z.object({ issueId: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const result = await ctx.db
  //       .select()
  //       .from(issueActivities)
  //       .where(eq(issueActivities.issueId, input.issueId))
  //       .orderBy(desc(issueActivities.createdAt));
  //
  //     return result;
  //   }),
});
