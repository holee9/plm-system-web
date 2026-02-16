"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type IssueStatus = "To Do" | "In Progress" | "In Review" | "Done" | "Blocked";
export type IssuePriority = "Critical" | "High" | "Medium" | "Low";

export interface Issue {
  id: string;
  key: string;
  summary: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
  dueDate: string;
}

export interface IssueTableProps {
  title?: string;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  actionLabel?: string;
  onActionClick?: () => void;
}

const statusColors: Record<IssueStatus, string> = {
  "To Do": "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
  "In Progress": "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "In Review": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "Done": "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  "Blocked": "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

const priorityColors: Record<IssuePriority, string> = {
  "Critical": "text-red-600 dark:text-red-400",
  "High": "text-orange-600 dark:text-orange-400",
  "Medium": "text-amber-600 dark:text-amber-400",
  "Low": "text-green-600 dark:text-green-400",
};

const priorityIcons: Record<IssuePriority, string> = {
  "Critical": "⚠",
  "High": "🔶",
  "Medium": "🔸",
  "Low": "🔹",
};

export function IssueTable({
  title = "Recent Issues",
  issues,
  onIssueClick,
  actionLabel,
  onActionClick,
}: IssueTableProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {onActionClick && actionLabel && (
            <button
              type="button"
              onClick={onActionClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Key</TableHead>
              <TableHead className="w-auto">Summary</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead className="w-[80px]">Assignee</TableHead>
              <TableHead className="w-[100px]">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow
                key={issue.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  "hover:bg-muted/50"
                )}
                onClick={() => onIssueClick?.(issue)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {issue.key}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {issue.summary}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-normal", statusColors[issue.status])}
                  >
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{priorityIcons[issue.priority]}</span>
                    <span className={cn("text-xs font-medium", priorityColors[issue.priority])}>
                      {issue.priority}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {issue.assignee}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(issue.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {issues.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No issues found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
