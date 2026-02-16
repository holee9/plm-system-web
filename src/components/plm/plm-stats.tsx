import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PLMStatItem {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
  href?: string;
}

interface PLMStatsProps {
  stats: PLMStatItem[];
  className?: string;
}

export function PLMStats({ stats, className }: PLMStatsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-5", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${stat.iconColor}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.iconColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
