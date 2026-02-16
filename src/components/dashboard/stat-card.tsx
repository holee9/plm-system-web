import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
  change: string;
  changeColor: string;
}

export function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  change,
  changeColor,
}: StatCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            <p className={cn("mt-1 text-xs font-medium", changeColor)}>
              {change}
            </p>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
