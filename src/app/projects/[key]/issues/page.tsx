import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { IssueBoard } from "@/components/issue/issue-board";
import { IssueList } from "@/components/issue/issue-list";
import { trpc } from "@/lib/trpc";

type ProjectIssuesPageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ view?: "board" | "list" }>;
};

export default async function ProjectIssuesPage({
  params,
  searchParams,
}: ProjectIssuesPageProps) {
  const { key } = await params;
  const { view = "board" } = await searchParams;

  // Fetch project data
  const project = await trpc.project.getByKey.query({ key });

  if (!project) {
    return (
      <div className="space-y-6 p-2 sm:p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">
            프로젝트를 찾을 수 없습니다
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{key.toUpperCase()} Issues</h1>
          <Badge variant="secondary">이슈 추적</Badge>
        </div>
      </div>

      {/* Issues Board */}
      <Tabs defaultValue={view} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="board" className="gap-2" asChild>
            <a href={`?view=board`}>
              <LayoutGrid className="h-4 w-4" />
              보드
            </a>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2" asChild>
            <a href={`?view=list`}>
              <List className="h-4 w-4" />
              목록
            </a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-0">
          <IssueBoard projectId={project.id} />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <IssueBoardWithList projectId={project.id} projectKey={project.key} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Client component wrapper for list view
import { IssueBoardWithList } from "./issues-client";
