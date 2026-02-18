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

  // ============================================================================
  // Custom Dashboard (D-012)
  // ============================================================================

  // Create a new dashboard
  createDashboard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        projectId: z.string().uuid(),
        layout: z.object({
          columns: z.number(),
          rows: z.number(),
          widgets: z.array(z.object({
            id: z.string(),
            type: z.enum(["stat", "chart", "list", "table", "custom"]),
            position: z.object({ x: z.number(), y: z.number() }),
            size: z.object({ w: z.number(), h: z.number() }),
            config: z.record(z.any()),
          })),
        }).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.createDashboard(authCtx.user.id, input);
    }),

  // Get a dashboard by ID
  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.getDashboard(input.dashboardId, authCtx.user.id);
    }),

  // List dashboards for a project
  listDashboards: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.listDashboards(authCtx.user.id, input.projectId);
    }),

  // Update a dashboard
  updateDashboard: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        layout: z.object({
          columns: z.number(),
          rows: z.number(),
          widgets: z.array(z.object({
            id: z.string(),
            type: z.enum(["stat", "chart", "list", "table", "custom"]),
            position: z.object({ x: z.number(), y: z.number() }),
            size: z.object({ w: z.number(), h: z.number() }),
            config: z.record(z.any()),
          })),
        }).optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      const { dashboardId, ...updateData } = input;
      return dashboardService.updateDashboard(dashboardId, authCtx.user.id, updateData);
    }),

  // Delete a dashboard
  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.deleteDashboard(input.dashboardId, authCtx.user.id);
    }),

  // Add a widget to a dashboard
  addWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string().uuid(),
        widget: z.object({
          id: z.string().optional(),
          type: z.enum(["stat", "chart", "list", "table", "custom"]),
          position: z.object({ x: z.number(), y: z.number() }),
          size: z.object({ w: z.number(), h: z.number() }),
          config: z.record(z.any()),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.addWidget(input.dashboardId, authCtx.user.id, input.widget);
    }),

  // Update a widget in a dashboard
  updateWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string().uuid(),
        widgetId: z.string(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
        size: z.object({ w: z.number(), h: z.number() }).optional(),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      const { dashboardId, widgetId, ...updateData } = input;
      return dashboardService.updateWidget(dashboardId, authCtx.user.id, widgetId, updateData);
    }),

  // Remove a widget from a dashboard
  removeWidget: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string().uuid(),
        widgetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.removeWidget(input.dashboardId, authCtx.user.id, input.widgetId);
    }),

  // Reorder widgets in a dashboard
  reorderWidgets: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string().uuid(),
        widgetPositions: z.array(
          z.object({
            id: z.string(),
            position: z.object({ x: z.number(), y: z.number() }),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.reorderWidgets(input.dashboardId, authCtx.user.id, input.widgetPositions);
    }),

  // Create a dashboard template
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        layout: z.object({
          columns: z.number(),
          rows: z.number(),
          widgets: z.array(z.object({
            id: z.string(),
            type: z.enum(["stat", "chart", "list", "table", "custom"]),
            position: z.object({ x: z.number(), y: z.number() }),
            size: z.object({ w: z.number(), h: z.number() }),
            config: z.record(z.any()),
          })),
        }),
        isPublic: z.boolean().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.createTemplate(authCtx.user.id, input);
    }),

  // List dashboard templates
  listTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.listTemplates(authCtx.user.id, input?.category);
    }),

  // Delete a template
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const authCtx = ctx as AuthenticatedContext;
      return dashboardService.deleteTemplate(input.templateId, authCtx.user.id);
    }),
});
