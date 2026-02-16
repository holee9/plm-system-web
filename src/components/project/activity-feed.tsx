"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  avatar: string;
  text: string;
  target: string;
  time: string;
  type?: "upload" | "comment" | "milestone" | "issue" | "default";
}

export interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
}

const activityIcons: Record<string, string> = {
  upload: "📁",
  comment: "💬",
  milestone: "🎯",
  issue: "✅",
  default: "📌",
};

export function ActivityFeed({
  title = "Activity",
  activities,
}: ActivityFeedProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 px-2 py-3",
                index < activities.length - 1 && "border-b border-border/40"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight">
                  <span className="font-medium">{activity.avatar}</span>{" "}
                  <span className="text-muted-foreground">{activity.text}</span>{" "}
                  <span className="font-medium text-foreground">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
              {activity.type && activityIcons[activity.type] && (
                <span className="text-base shrink-0">{activityIcons[activity.type]}</span>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
