import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectIssuesPageProps = {
  params: { key: string };
};

export default function ProjectIssuesPage({ params }: ProjectIssuesPageProps) {
  const { key } = params;

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{key.toUpperCase()} Issues</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>이슈 목록/보드(예정)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          필터, 우선순위, 상태 워크플로우, 칸반 보드가 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
