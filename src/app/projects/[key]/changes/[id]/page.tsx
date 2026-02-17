import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { ChangeOrderDetail } from "@/components/changes/change-order-detail";

type ChangeOrderDetailPageProps = {
  params: Promise<{ key: string; id: string }>;
};

export default async function ChangeOrderDetailPage({
  params,
}: ChangeOrderDetailPageProps) {
  const { key, id } = await params;

  // Verify project exists
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);
  if (!project) {
    notFound();
  }

  return <ChangeOrderDetail projectKey={project.key} />;
}
