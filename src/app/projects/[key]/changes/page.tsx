import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectChangesPageProps = {
  params: Promise<{ key: string }>;
};

export default async function ProjectChangesPage({
  params,
}: ProjectChangesPageProps) {
  const { key } = await params;

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{key.toUpperCase()} Changes</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>ECR/ECN 워크플로우(예정)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          변경 요청 생성, 승인 라우팅, 감사 추적 타임라인이 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
