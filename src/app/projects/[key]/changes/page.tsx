import { notFound } from "next/navigation";
import { ChangesPageClient } from "./changes-page-client";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type ProjectChangesPageProps = {
  params: Promise<{ key: string }>;
};

export default async function ProjectChangesPage({
  params,
}: ProjectChangesPageProps) {
  const { key } = await params;

  // Fetch project data
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);

  if (!project) {
    notFound();
  }

  return (
    <ChangesPageClient
      projectId={project.id}
      projectKey={project.key}
      projectName={project.name}
    />
  );
}
