/**
 * Widget Service
 * Business logic for custom dashboard widget management
 */
import { eq, and, desc } from "drizzle-orm";
import { db } from "~/server/db";
import { userDashboards, dashboardTemplates } from "~/server/db";
import type {
  UserDashboard,
  NewUserDashboard,
  DashboardTemplate,
  NewDashboardTemplate,
  Widget,
  DashboardLayout,
} from "~/server/db";

// ============================================================================
// Type Definitions
// ============================================================================

export interface CreateDashboardInput {
  name: string;
  description?: string;
  projectId: string;
  layout?: DashboardLayout;
  isDefault?: boolean;
}

export interface UpdateDashboardInput {
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  isDefault?: boolean;
}

export interface CreateWidgetInput {
  id?: string;
  type: "stat" | "chart" | "list" | "table" | "custom";
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: Record<string, any>;
}

export interface UpdateWidgetInput {
  position?: { x: number; y: number };
  size?: { w: number; h: number };
  config?: Record<string, any>;
}

export interface WidgetPosition {
  id: string;
  position: { x: number; y: number };
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  layout: DashboardLayout;
  isPublic?: boolean;
  category?: string;
}

// ============================================================================
// Dashboard CRUD Operations
// ============================================================================

/**
 * Create a new custom dashboard
 */
export async function createDashboard(
  userId: string,
  input: CreateDashboardInput
): Promise<UserDashboard> {
  return db.transaction(async (tx) => {
    // If setting as default, unset other default dashboards
    if (input.isDefault) {
      await tx
        .update(userDashboards)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(userDashboards.projectId, input.projectId),
            eq(userDashboards.userId, userId),
            eq(userDashboards.isDefault, true)
          )
        );
    }

    // Create new dashboard
    const layout = input.layout || createDefaultLayout();

    const [dashboard] = await tx
      .insert(userDashboards)
      .values({
        userId,
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        layout,
        isDefault: input.isDefault || false,
      })
      .returning();

    return dashboard;
  });
}

/**
 * Get a dashboard by ID
 */
export async function getDashboard(
  dashboardId: string,
  userId: string
): Promise<UserDashboard> {
  const [dashboard] = await db
    .select()
    .from(userDashboards)
    .where(
      and(
        eq(userDashboards.id, dashboardId),
        eq(userDashboards.userId, userId)
      )
    )
    .limit(1);

  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  return dashboard;
}

/**
 * List all dashboards for a project
 */
export async function listDashboards(
  userId: string,
  projectId: string
): Promise<UserDashboard[]> {
  return db
    .select()
    .from(userDashboards)
    .where(
      and(
        eq(userDashboards.projectId, projectId),
        eq(userDashboards.userId, userId)
      )
    )
    .orderBy(desc(userDashboards.isDefault), desc(userDashboards.updatedAt));
}

/**
 * Update a dashboard
 */
export async function updateDashboard(
  dashboardId: string,
  userId: string,
  input: UpdateDashboardInput
): Promise<UserDashboard> {
  return db.transaction(async (tx) => {
    // Verify ownership
    const dashboard = await getDashboard(dashboardId, userId);

    // If setting as default, unset other defaults
    if (input.isDefault && !dashboard.isDefault) {
      await tx
        .update(userDashboards)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(userDashboards.projectId, dashboard.projectId),
            eq(userDashboards.userId, userId),
            eq(userDashboards.isDefault, true)
          )
        );
    }

    // Update dashboard
    const [updated] = await tx
      .update(userDashboards)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(userDashboards.id, dashboardId))
      .returning();

    return updated;
  });
}

/**
 * Delete a dashboard
 */
export async function deleteDashboard(
  dashboardId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  await getDashboard(dashboardId, userId);

  await db
    .delete(userDashboards)
    .where(eq(userDashboards.id, dashboardId));
}

// ============================================================================
// Widget Management
// ============================================================================

/**
 * Add a widget to a dashboard
 */
export async function addWidget(
  dashboardId: string,
  userId: string,
  input: CreateWidgetInput
): Promise<UserDashboard> {
  const dashboard = await getDashboard(dashboardId, userId);

  const newWidget: Widget = {
    id: input.id || generateWidgetId(),
    type: input.type,
    position: input.position,
    size: input.size,
    config: input.config,
  };

  const updatedLayout: DashboardLayout = {
    ...dashboard.layout,
    widgets: [...dashboard.layout.widgets, newWidget],
  };

  return updateDashboard(dashboardId, userId, { layout: updatedLayout });
}

/**
 * Update a widget in a dashboard
 */
export async function updateWidget(
  dashboardId: string,
  userId: string,
  widgetId: string,
  input: UpdateWidgetInput
): Promise<UserDashboard> {
  const dashboard = await getDashboard(dashboardId, userId);

  const widgetIndex = dashboard.layout.widgets.findIndex((w) => w.id === widgetId);
  if (widgetIndex === -1) {
    throw new Error("Widget not found");
  }

  const updatedWidgets = [...dashboard.layout.widgets];
  updatedWidgets[widgetIndex] = {
    ...updatedWidgets[widgetIndex],
    ...input,
  };

  const updatedLayout: DashboardLayout = {
    ...dashboard.layout,
    widgets: updatedWidgets,
  };

  return updateDashboard(dashboardId, userId, { layout: updatedLayout });
}

/**
 * Remove a widget from a dashboard
 */
export async function removeWidget(
  dashboardId: string,
  userId: string,
  widgetId: string
): Promise<UserDashboard> {
  const dashboard = await getDashboard(dashboardId, userId);

  const widgetExists = dashboard.layout.widgets.some((w) => w.id === widgetId);
  if (!widgetExists) {
    throw new Error("Widget not found");
  }

  const updatedLayout: DashboardLayout = {
    ...dashboard.layout,
    widgets: dashboard.layout.widgets.filter((w) => w.id !== widgetId),
  };

  return updateDashboard(dashboardId, userId, { layout: updatedLayout });
}

/**
 * Reorder widgets in a dashboard
 */
export async function reorderWidgets(
  dashboardId: string,
  userId: string,
  widgetPositions: WidgetPosition[]
): Promise<UserDashboard> {
  const dashboard = await getDashboard(dashboardId, userId);

  const positionMap = new Map(
    widgetPositions.map((wp) => [wp.id, wp.position])
  );

  const updatedWidgets = dashboard.layout.widgets.map((widget) => {
    const newPosition = positionMap.get(widget.id);
    return newPosition
      ? { ...widget, position: newPosition }
      : widget;
  });

  const updatedLayout: DashboardLayout = {
    ...dashboard.layout,
    widgets: updatedWidgets,
  };

  return updateDashboard(dashboardId, userId, { layout: updatedLayout });
}

// ============================================================================
// Template Management
// ============================================================================

/**
 * Create a dashboard template
 */
export async function createTemplate(
  userId: string,
  input: CreateTemplateInput
): Promise<DashboardTemplate> {
  const [template] = await db
    .insert(dashboardTemplates)
    .values({
      userId,
      name: input.name,
      description: input.description,
      layout: input.layout,
      isPublic: input.isPublic || false,
      category: input.category,
    })
    .returning();

  return template;
}

/**
 * List templates (user's own + public templates)
 */
export async function listTemplates(
  userId: string,
  category?: string
): Promise<DashboardTemplate[]> {
  return db
    .select()
    .from(dashboardTemplates)
    .where(
      category
        ? eq(dashboardTemplates.category, category)
        : undefined
    )
    .orderBy(desc(dashboardTemplates.isPublic), desc(dashboardTemplates.createdAt));
}

/**
 * Get a template by ID
 */
export async function getTemplate(
  templateId: string,
  userId: string
): Promise<DashboardTemplate> {
  const [template] = await db
    .select()
    .from(dashboardTemplates)
    .where(
      and(
        eq(dashboardTemplates.id, templateId)
      )
    )
    .limit(1);

  if (!template) {
    throw new Error("Template not found");
  }

  // Verify access (owner or public)
  if (template.userId !== userId && !template.isPublic) {
    throw new Error("Access denied");
  }

  return template;
}

/**
 * Delete a template
 */
export async function deleteTemplate(
  templateId: string,
  userId: string
): Promise<void> {
  const template = await getTemplate(templateId, userId);

  if (template.userId !== userId) {
    throw new Error("Access denied");
  }

  await db
    .delete(dashboardTemplates)
    .where(eq(dashboardTemplates.id, templateId));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a default empty layout
 */
function createDefaultLayout(): DashboardLayout {
  return {
    columns: 12,
    rows: 1,
    widgets: [],
  };
}

/**
 * Generate a unique widget ID
 */
function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate widget position (check for collisions)
 */
export function validateWidgetPosition(
  layout: DashboardLayout,
  widget: Widget,
  excludeWidgetId?: string
): boolean {
  const { x, y } = widget.position;
  const { w, h } = widget.size;

  // Check bounds
  if (x + w > layout.columns || x < 0 || y < 0) {
    return false;
  }

  // Check for collisions with other widgets
  for (const other of layout.widgets) {
    if (excludeWidgetId && other.id === excludeWidgetId) {
      continue;
    }

    const otherX = other.position.x;
    const otherY = other.position.y;
    const otherW = other.size.w;
    const otherH = other.size.h;

    // Check for overlap
    if (
      x < otherX + otherW &&
      x + w > otherX &&
      y < otherY + otherH &&
      y + h > otherY
    ) {
      return false;
    }
  }

  return true;
}
