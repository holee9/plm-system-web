/**
 * Custom Dashboard Page
 * Route: /projects/[key]/dashboard/custom
 */
import { notFound } from "next/navigation";
import { CustomDashboardClient } from "./custom-dashboard-client";
import { db } from "~/server/db";
import { projects, eq } from "~/server/db";

interface CustomDashboardPageProps {
  params: {
    key: string;
  };
}

async function getProjectId(key: string): Promise<string | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.key, key))
    .limit(1);

  return project?.id || null;
}

export default async function CustomDashboardPage({
  params,
}: CustomDashboardPageProps) {
  const projectId = await getProjectId(params.key);

  if (!projectId) {
    notFound();
  }

  return <CustomDashboardClient projectId={projectId} projectKey={params.key} />;
}
