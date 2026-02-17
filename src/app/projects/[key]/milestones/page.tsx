// Milestones Page
import { Suspense } from "react";
import { MilestoneList } from "@/components/milestone/MilestoneList";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ key: string }>;
}

async function MilestonesContent({ key }: { key: string }) {
  // Get project by key to retrieve projectId
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have access.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return <MilestoneList projectId={project.id} />;
}

export default async function MilestonesPage({ params }: PageProps) {
  const { key } = await params;

  return (
    <div className="container mx-auto py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading milestones...</p>
          </div>
        }
      >
        <MilestonesContent key={key} />
      </Suspense>
    </div>
  );
}
