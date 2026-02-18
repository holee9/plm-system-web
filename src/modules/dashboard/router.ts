/**
 * Dashboard tRPC Router
 * Exposes dashboard statistics, charts, and activity feed procedures
 */
import { z } from "zod";
import { router as createTRPCRouter, protectedProcedure } from "~/server/trpc";
import type { AuthenticatedContext } from "~/server/trpc/middleware/is-authed";
import * as dashboardService from "./service";

export const dashboardRouter = createTRPCRouter({
  // Get complete dashboard data
  getData: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.getDashboardData(input.projectId, authCtx.user.id);
    }),

  // Get project statistics
  statistics: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.getProjectStatistics(input.projectId, authCtx.user.id);
    }),

  // Get issue status distribution
  statusDistribution: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return dashboardService.getIssueStatusDistribution(input.projectId);
    }),

  // Get issue priority distribution
  priorityDistribution: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return dashboardService.getIssuePriorityDistribution(input.projectId);
    }),

  // Get milestone progress
  milestoneProgress: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ input }) => {
      return dashboardService.getMilestoneProgress(input.projectId);
    }),

  // Get recent activities
  recentActivities: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      return dashboardService.getRecentActivities(input.projectId, input.limit);
    }),

  // Get dashboard statistics for widgets (D-012)
  getDashboardStats: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.getDashboardData(input.projectId, authCtx.user.id);
    }),

  // Get user's assigned issues
  myIssues: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.getUserAssignedIssues(
        authCtx.user.id,
        input.projectId,
        input.limit
      );
    }),
});
