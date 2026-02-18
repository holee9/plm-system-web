import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { NewChangeOrderPageClient } from "./new-change-order-page-client";

type NewChangeOrderPageProps = {
  params: Promise<{ key: string }>;
};

export default async function NewChangeOrderPage({
  params,
}: NewChangeOrderPageProps) {
  const { key } = await params;

  // Fetch project data
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);

  if (!project) {
    notFound();
  }

  return (
    <NewChangeOrderPageClient
      projectId={project.id}
      projectKey={project.key}
      projectName={project.name}
    />
  );
}
