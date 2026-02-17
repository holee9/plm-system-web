// Labels Page
import { LabelList } from "@/components/label/LabelList";
import { trpc } from "@/lib/trpc";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function LabelsPage({ params }: PageProps) {
  const { key } = await params;

  // Get project by key to obtain the project ID
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

  return <LabelList projectId={project.id} />;
}
