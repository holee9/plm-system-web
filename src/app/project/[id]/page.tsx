"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "@/components/project/project-header";
import { GanttChart, GanttTask, GanttMilestone } from "@/components/project/gantt-chart";
import { TeamList, TeamMember } from "@/components/project/team-list";
import { IssueTable, Issue } from "@/components/project/issue-table";
import { ActivityFeed, ActivityItem } from "@/components/project/activity-feed";
import type { Metadata } from "next";

// Mock data - will be replaced with API calls
const mockProject = {
  id: "ECU-2024",
  title: "ECU Development 2024",
  key: "ECU-2024",
  status: "In Progress" as const,
  dateRange: "Jan 15 - Jun 30, 2024",
  memberCount: 5,
  progress: 65,
};

const mockGanttTasks: GanttTask[] = [
  {
    id: "task-1",
    name: "Requirements Analysis",
    start: "2024-01-15",
    end: "2024-02-15",
    progress: 100,
    color: "#22c55e",
    assignee: "JD",
  },
  {
    id: "task-2",
    name: "Hardware Design",
    start: "2024-02-01",
    end: "2024-04-15",
    progress: 75,
    color: "#3b82f6",
    assignee: "SK",
  },
  {
    id: "task-3",
    name: "Software Development",
    start: "2024-03-01",
    end: "2024-05-30",
    progress: 40,
    color: "#f59e0b",
    assignee: "MJ",
  },
  {
    id: "task-4",
    name: "Testing & Validation",
    start: "2024-05-01",
    end: "2024-06-15",
    progress: 0,
    color: "#71717a",
    assignee: "AL",
  },
  {
    id: "task-5",
    name: "Production",
    start: "2024-06-01",
    end: "2024-06-30",
    progress: 0,
    color: "#71717a",
    assignee: "RK",
  },
];

const mockMilestones: GanttMilestone[] = [
  {
    id: "milestone-1",
    name: "Design Review",
    date: "2024-03-15",
    color: "#ef4444",
  },
  {
    id: "milestone-2",
    name: "Alpha Release",
    date: "2024-05-15",
    color: "#3b82f6",
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "John Doe",
    role: "Project Lead",
    avatar: "JD",
    email: "john@example.com",
  },
  {
    id: "member-2",
    name: "Sarah Kim",
    role: "Hardware Engineer",
    avatar: "SK",
    email: "sarah@example.com",
  },
  {
    id: "member-3",
    name: "Mike Johnson",
    role: "Software Engineer",
    avatar: "MJ",
    email: "mike@example.com",
  },
  {
    id: "member-4",
    name: "Anna Lee",
    role: "QA Engineer",
    avatar: "AL",
    email: "anna@example.com",
  },
  {
    id: "member-5",
    name: "Robert Kim",
    role: "DevOps Engineer",
    avatar: "RK",
    email: "robert@example.com",
  },
];

const mockIssues: Issue[] = [
  {
    id: "issue-1",
    key: "PLM-144",
    summary: "Fix battery thermal management",
    status: "To Do",
    priority: "Critical",
    assignee: "JD",
    dueDate: "2024-04-15",
  },
  {
    id: "issue-2",
    key: "PLM-140",
    summary: "Implement BOM versioning",
    status: "In Progress",
    priority: "High",
    assignee: "SK",
    dueDate: "2024-04-20",
  },
  {
    id: "issue-3",
    key: "PLM-138",
    summary: "Add CAD file preview",
    status: "In Review",
    priority: "Medium",
    assignee: "MJ",
    dueDate: "2024-04-10",
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: "activity-1",
    avatar: "SK",
    text: "uploaded CAD file",
    target: "ecu_v2.dwg",
    time: "5 min ago",
    type: "upload",
  },
  {
    id: "activity-2",
    avatar: "MJ",
    text: "commented on",
    target: "PLM-140",
    time: "1 hour ago",
    type: "comment",
  },
  {
    id: "activity-3",
    avatar: "JD",
    text: "created milestone",
    target: "Design Review",
    time: "2 hours ago",
    type: "milestone",
  },
  {
    id: "activity-4",
    avatar: "AL",
    text: "completed issue",
    target: "PLM-137",
    time: "3 hours ago",
    type: "issue",
  },
];

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = React.useState("overview");

  const handleTaskClick = (task: GanttTask) => {
    console.log("Task clicked:", task);
    // TODO: Navigate to task detail or open modal
  };

  const handleMemberClick = (member: TeamMember) => {
    console.log("Member clicked:", member);
    // TODO: Open member profile modal
  };

  const handleIssueClick = (issue: Issue) => {
    console.log("Issue clicked:", issue);
    // TODO: Navigate to issue detail page
  };

  const handleEditProject = () => {
    console.log("Edit project clicked");
    // TODO: Open edit project modal
  };

  const handleAddIssue = () => {
    console.log("Add issue clicked");
    // TODO: Open create issue modal
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Project Header */}
      <ProjectHeader
        {...mockProject}
        onEdit={handleEditProject}
        onAddIssue={handleAddIssue}
      />

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gantt Chart */}
              <div className="lg:col-span-2">
                <GanttChart
                  timeline={{
                    start: "2024-01-01",
                    end: "2024-06-30",
                    granularity: "week",
                  }}
                  tasks={mockGanttTasks}
                  milestones={mockMilestones}
                  currentDate="2024-04-01"
                  onTaskClick={handleTaskClick}
                />
              </div>

              {/* Team Members */}
              <div>
                <TeamList
                  members={mockTeamMembers}
                  onMemberClick={handleMemberClick}
                />
              </div>
            </div>

            {/* Recent Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <IssueTable
                  issues={mockIssues}
                  onIssueClick={handleIssueClick}
                  actionLabel="View all (24)"
                  onActionClick={() => console.log("View all issues")}
                />
              </div>

              {/* Activity Feed */}
              <div>
                <ActivityFeed activities={mockActivities} />
              </div>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <IssueTable
              title="All Issues"
              issues={mockIssues}
              onIssueClick={handleIssueClick}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <GanttChart
              timeline={{
                start: "2024-01-01",
                end: "2024-06-30",
                granularity: "week",
              }}
              tasks={mockGanttTasks}
              milestones={mockMilestones}
              currentDate="2024-04-01"
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="max-w-2xl">
              <ActivityFeed activities={mockActivities} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
