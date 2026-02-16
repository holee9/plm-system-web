import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectPage() {
  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
      <p className="text-muted-foreground">
        프로젝트 생성, 마일스톤, 멤버 관리를 위한 모듈 페이지입니다.
      </p>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>프로젝트 목록</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          프로젝트 카드 그리드/테이블, 상태 필터, 생성 액션이 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
