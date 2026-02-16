import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectDetailPageProps = {
  params: Promise<{ key: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { key } = await params;

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Project {key.toUpperCase()}</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <p className="text-muted-foreground">
        프로젝트 상세 대시보드 기본 경로입니다.
      </p>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>프로젝트 요약</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          일정, 이슈, BOM, 변경 주문 요약 카드가 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
