import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { IssueBoard } from "@/components/issue/issue-board";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type BoardPageProps = {
  params: Promise<{ key: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { key } = await params;

  // Fetch project data
  const [project] = await db.select().from(projects).where(eq(projects.key, key)).limit(1);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${key}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              프로젝트
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="secondary">칸반 보드</Badge>
        </div>

        <Link href={`/projects/${key}/issues`}>
          <Button variant="outline" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            목록 보기
          </Button>
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <IssueBoard projectId={project.id} />
      </div>
    </div>
  );
}
