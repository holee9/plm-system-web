import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  name: string;
  projectKey: string;
  progress: number;
  status: string;
  statusColor?: string;
  members: string[];
  href?: string;
}

export function ProjectCard({
  name,
  projectKey,
  progress,
  status,
  statusColor,
  members,
  href,
}: ProjectCardProps) {
  const cardContent = (
    <>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{name}</h3>
              <Badge variant="outline" className="text-xs">
                {projectKey}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    status === "In Progress" && "bg-primary",
                    status === "Review" && "bg-amber-500",
                    status === "Completed" && "bg-green-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              status === "In Progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              status === "Review" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
              status === "Completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {status}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, index) => (
              <Avatar
                key={index}
                className="ring-2 ring-background h-7 w-7 border-border"
              >
                <AvatarFallback className="text-[10px] font-medium">
                  {member}
                </AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <Avatar className="ring-2 ring-background h-7 w-7 border-border">
                <AvatarFallback className="bg-muted text-[10px] font-medium">
                  +{members.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            View
          </Button>
        </div>
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="border-border/50 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
      {cardContent}
    </Card>
  );
}
