import { z } from "zod";
import { eq, and, desc, asc, sql } from "drizzle-orm";

import { publicProcedure, router } from "../index";
import { issues, issueComments, issueActivities } from "../../db";

// Input schemas
const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  type: z.enum(["bug", "story", "task", "epic"]).default("task"),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  status: z.enum(["todo", "inProgress", "inReview", "done"]).default("todo"),
  assigneeId: z.number().optional(),
  reporterId: z.number().optional(),
  projectId: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

const updateIssueSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(["bug", "story", "task", "epic"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  status: z.enum(["todo", "inProgress", "inReview", "done"]).optional(),
  assigneeId: z.number().optional(),
  reporterId: z.number().optional(),
  projectId: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

const listIssuesSchema = z.object({
  projectId: z.number().optional(),
  assigneeId: z.number().optional(),
  status: z.enum(["todo", "inProgress", "inReview", "done"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  type: z.enum(["bug", "story", "task", "epic"]).optional(),
  onlyMyIssues: z.boolean().default(false),
  currentUserId: z.number().optional(),
});

const createCommentSchema = z.object({
  issueId: z.number(),
  content: z.string().min(1, "Comment is required"),
  authorId: z.number(),
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
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  // Get issue with comments and activities
  getDetail: publicProcedure
    .input(z.object({ id: z.number() }))
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

      const activitiesResult = await ctx.db
        .select()
        .from(issueActivities)
        .where(eq(issueActivities.issueId, input.id))
        .orderBy(desc(issueActivities.createdAt));

      return {
        issue,
        comments: commentsResult,
        activities: activitiesResult,
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
      const key = `ISS-${String(count + 1).padStart(3, "0")}`;

      const result = await ctx.db
        .insert(issues)
        .values({
          ...input,
          key,
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
          updatedAt: new Date().getTime(),
        })
        .where(eq(issues.id, id))
        .returning();

      return result[0];
    }),

  // Delete issue
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
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
    .input(z.object({ issueId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(issueComments)
        .where(eq(issueComments.issueId, input.issueId))
        .orderBy(asc(issueComments.createdAt));

      return result;
    }),

  // Get activities for issue
  getActivities: publicProcedure
    .input(z.object({ issueId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(issueActivities)
        .where(eq(issueActivities.issueId, input.issueId))
        .orderBy(desc(issueActivities.createdAt));

      return result;
    }),
});
