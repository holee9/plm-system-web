import { Badge } from "@/components/ui/badge";
import type { PartStatus } from "@/modules/plm/types";

interface PartStatusBadgeProps {
  status: PartStatus;
}

export function PartStatusBadge({ status }: PartStatusBadgeProps) {
  const variants: Record<PartStatus, "default" | "secondary" | "destructive"> = {
    draft: "secondary",
    active: "default",
    obsolete: "destructive",
  };

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}
