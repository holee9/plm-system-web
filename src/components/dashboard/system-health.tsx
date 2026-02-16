"use client";

import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export function SystemHealth() {
  const { data, isLoading, isError } = trpc.health.check.useQuery();

  if (isLoading) {
    return <Badge variant="secondary">API checking...</Badge>;
  }

  if (isError || !data) {
    return <Badge variant="destructive">API unavailable</Badge>;
  }

  return (
    <Badge variant={data.status === "ok" ? "default" : "destructive"}>
      API {data.status.toUpperCase()}
    </Badge>
  );
}
