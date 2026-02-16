import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  avatar: string;
  text: string;
  time: string;
  icon: LucideIcon;
}

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
}

export function ActivityFeed({ title, activities }: ActivityFeedProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 border-b border-border/40 px-2 py-3 last:border-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {activity.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm leading-tight">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <activity.icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
