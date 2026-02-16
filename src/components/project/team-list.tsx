"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface TeamListProps {
  title?: string;
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  actionLabel?: string;
  onActionClick?: () => void;
}

export function TeamList({
  title = "Team",
  members,
  onMemberClick,
  actionLabel = "Manage",
  onActionClick,
}: TeamListProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {onActionClick && (
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
      <CardContent>
        <div className="space-y-1">
          {members.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onMemberClick?.(member)}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-3 text-left",
                "hover:bg-muted/50 transition-colors",
                "group"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback
                  className={cn(
                    "bg-primary/10 text-primary text-sm font-semibold",
                    "group-hover:bg-primary/20 transition-colors"
                  )}
                >
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    {member.role}
                  </Badge>
                </div>
              </div>
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No team members yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
