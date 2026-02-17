/**
 * Dashboard tRPC Router
 * Exposes dashboard statistics, charts, and activity feed procedures
 */
import { z } from "zod";
import { router as createTRPCRouter, protectedProcedure } from "~/server/trpc";
import * as dashboardService from "./service";

export const dashboardRouter = createTRPCRouter({
  // Get complete dashboard data
  getData: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return dashboardService.getDashboardData(input.projectId, ctx.user.id);
    }),

  // Get project statistics
  statistics: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return dashboardService.getProjectStatistics(input.projectId, ctx.user.id);
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

  // Get user's assigned issues
  myIssues: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      return dashboardService.getUserAssignedIssues(
        ctx.user.id,
        input.projectId,
        input.limit
      );
    }),
});
