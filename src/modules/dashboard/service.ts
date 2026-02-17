/**
 * Dashboard Service
 * Business logic for project statistics, charts, and activity feed
 */
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { projects, projectMembers } from "~/server/db";
import { issues } from "~/modules/issue/schemas";
import { milestones } from "~/modules/issue/schemas/milestones";
import { parts } from "~/server/db/parts";
import { bomItems } from "~/server/db/bom_items";
import { changeOrders } from "~/server/db/change-orders";
import { users } from "~/server/db/users";

// ============================================================================
// Type Definitions
// ============================================================================

export interface ProjectStatistics {
  totalIssues: number;
  openIssues: number;
  completedIssues: number;
  totalParts: number;
  totalBomItems: number;
  totalChangeOrders: number;
  pendingChangeOrders: number;
  issueCompletionRate: number;
}

export interface IssueStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface IssuePriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface MilestoneProgress {
  milestoneId: string;
  title: string;
  progress: number;
  dueDate: Date | null;
  issueCount: number;
  completedIssueCount: number;
}

export interface RecentActivity {
  id: string;
  type: "issue" | "part" | "change_order" | "milestone";
  action: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: Date;
  resourceId?: string;
}

export interface DashboardData {
  statistics: ProjectStatistics;
  statusDistribution: IssueStatusDistribution[];
  priorityDistribution: IssuePriorityDistribution[];
  milestones: MilestoneProgress[];
  recentActivities: RecentActivity[];
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get complete project statistics for dashboard
 */
export async function getProjectStatistics(
  projectId: string,
  userId: string
): Promise<ProjectStatistics> {
  // Verify user has access to project
  const membership = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  if (membership.length === 0) {
    throw new Error("Access denied to project");
  }

  // Get issue counts
  const [issueStats] = await db
    .select({
      total: count(),
      open: count(
        sql`CASE WHEN ${issues.status} = 'open' OR ${issues.status} = 'in_progress' OR ${issues.status} = 'review' THEN 1 END`
      ),
      completed: count(
        sql`CASE WHEN ${issues.status} = 'done' OR ${issues.status} = 'closed' THEN 1 END`
      ),
    })
    .from(issues)
    .where(eq(issues.projectId, projectId));

  // Get part count
  const [partCount] = await db
    .select({ total: count() })
    .from(parts)
    .where(eq(parts.projectId, projectId));

  // Get BOM item count (indirect - parts in this project)
  const [bomCount] = await db
    .select({ total: count() })
    .from(bomItems)
    .innerJoin(parts, eq(bomItems.parentPartId, parts.id))
    .where(eq(parts.projectId, projectId));

  // Get change order counts
  const [changeOrderStats] = await db
    .select({
      total: count(),
      pending: count(
        sql`CASE WHEN ${changeOrders.status} = 'submitted' OR ${changeOrders.status} = 'in_review' THEN 1 END`
      ),
    })
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId));

  const total = issueStats.total || 0;
  const completed = issueStats.completed || 0;

  return {
    totalIssues: total || 0,
    openIssues: issueStats.open || 0,
    completedIssues: completed,
    totalParts: partCount.total || 0,
    totalBomItems: bomCount.total || 0,
    totalChangeOrders: changeOrderStats.total || 0,
    pendingChangeOrders: changeOrderStats.pending || 0,
    issueCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Get issue status distribution for charts
 */
export async function getIssueStatusDistribution(
  projectId: string
): Promise<IssueStatusDistribution[]> {
  const results = await db
    .select({
      status: issues.status,
      count: count(),
    })
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .groupBy(issues.status);

  const total = results.reduce((sum, r) => sum + Number(r.count), 0);

  return results.map((r) => ({
    status: r.status,
    count: Number(r.count),
    percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
  }));
}

/**
 * Get issue priority distribution for charts
 */
export async function getIssuePriorityDistribution(
  projectId: string
): Promise<IssuePriorityDistribution[]> {
  const results = await db
    .select({
      priority: issues.priority,
      count: count(),
    })
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .groupBy(issues.priority);

  const total = results.reduce((sum, r) => sum + Number(r.count), 0);

  return results.map((r) => ({
    priority: r.priority,
    count: Number(r.count),
    percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
  }));
}

/**
 * Get milestones with progress
 */
export async function getMilestoneProgress(
  projectId: string
): Promise<MilestoneProgress[]> {
  const projectMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId));

  const result: MilestoneProgress[] = [];

  for (const milestone of projectMilestones) {
    // Get issue counts for this milestone
    const [issueStats] = await db
      .select({
        total: count(),
        completed: count(
          sql`CASE WHEN ${issues.status} = 'done' OR ${issues.status} = 'closed' THEN 1 END`
        ),
      })
      .from(issues)
      .where(eq(issues.milestoneId, milestone.id));

    const total = Number(issueStats.total) || 0;
    const completed = Number(issueStats.completed) || 0;

    result.push({
      milestoneId: milestone.id,
      title: milestone.title,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      dueDate: milestone.dueDate,
      issueCount: total,
      completedIssueCount: completed,
    });
  }

  // Sort by due date (earliest first), then by progress
  result.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.progress - a.progress;
  });

  return result;
}

/**
 * Get recent activities for project
 */
export async function getRecentActivities(
  projectId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // Get recent issues
  const recentIssues = await db
    .select({
      id: issues.id,
      title: issues.title,
      createdAt: issues.createdAt,
      updatedAt: issues.updatedAt,
    })
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .orderBy(desc(issues.updatedAt))
    .limit(5);

  for (const issue of recentIssues) {
    const [creator] = await db
      .select({ name: users.name, id: users.id })
      .from(users)
      .where(eq(users.id, issue.reporterId || ""))
      .limit(1);

    activities.push({
      id: `issue-${issue.id}`,
      type: "issue",
      action: "updated",
      description: `Issue "${issue.title}" was updated`,
      userId: creator?.id || "",
      userName: creator?.name || "Unknown",
      createdAt: issue.updatedAt,
      resourceId: issue.id,
    });
  }

  // Get recent change orders
  const recentChangeOrders = await db
    .select({
      id: changeOrders.id,
      title: changeOrders.title,
      status: changeOrders.status,
      createdAt: changeOrders.createdAt,
      updatedAt: changeOrders.updatedAt,
    })
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId))
    .orderBy(desc(changeOrders.updatedAt))
    .limit(5);

  for (const co of recentChangeOrders) {
    const [creator] = await db
      .select({ name: users.name, id: users.id })
      .from(users)
      .where(eq(users.id, co.requesterId))
      .limit(1);

    activities.push({
      id: `co-${co.id}`,
      type: "change_order",
      action: "updated",
      description: `Change order "${co.title}" is ${co.status}`,
      userId: creator?.id || "",
      userName: creator?.name || "Unknown",
      createdAt: co.updatedAt,
      resourceId: co.id,
    });
  }

  // Get recent milestones
  const recentMilestones = await db
    .select({
      id: milestones.id,
      title: milestones.title,
      createdAt: milestones.createdAt,
      updatedAt: milestones.updatedAt,
    })
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(desc(milestones.updatedAt))
    .limit(3);

  for (const milestone of recentMilestones) {
    activities.push({
      id: `milestone-${milestone.id}`,
      type: "milestone",
      action: "updated",
      description: `Milestone "${milestone.title}" was updated`,
      userId: "",
      userName: "System",
      createdAt: milestone.updatedAt,
      resourceId: milestone.id,
    });
  }

  // Sort by date and limit
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return activities.slice(0, limit);
}

/**
 * Get complete dashboard data
 */
export async function getDashboardData(
  projectId: string,
  userId: string
): Promise<DashboardData> {
  const [statistics, statusDistribution, priorityDistribution, milestones, recentActivities] =
    await Promise.all([
      getProjectStatistics(projectId, userId),
      getIssueStatusDistribution(projectId),
      getIssuePriorityDistribution(projectId),
      getMilestoneProgress(projectId),
      getRecentActivities(projectId),
    ]);

  return {
    statistics,
    statusDistribution,
    priorityDistribution,
    milestones,
    recentActivities,
  };
}

/**
 * Get user's assigned issues for dashboard
 */
export async function getUserAssignedIssues(
  userId: string,
  projectId: string,
  limit: number = 5
): Promise<any[]> {
  return db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.projectId, projectId),
        eq(issues.assigneeId, userId),
        sql`${issues.status} != 'closed'`
      )
    )
    .orderBy(desc(issues.updatedAt))
    .limit(limit);
}
