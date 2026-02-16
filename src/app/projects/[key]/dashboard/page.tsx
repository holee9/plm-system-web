import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectDashboardPageProps = {
  params: Promise<{ key: string }>;
};

export default async function ProjectDashboardPage({
  params,
}: ProjectDashboardPageProps) {
  const { key } = await params;

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{key.toUpperCase()} Dashboard</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <p className="text-muted-foreground">
        프로젝트별 대시보드 경로(`projects/[key]/dashboard`) 준비 완료.
      </p>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>대시보드 위젯(예정)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          진행률, 활동 피드, 알림, 리포팅 위젯이 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
