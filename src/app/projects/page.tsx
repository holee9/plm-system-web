import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <p className="text-muted-foreground">
        SPEC-PLM-003 대상 경로 정합을 위한 프로젝트 목록 스켈레톤입니다.
      </p>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>프로젝트 목록(예정)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          프로젝트 카드/테이블, 필터, 생성 액션이 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
