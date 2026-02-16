import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IdentityPage() {
  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Identity</h1>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
      <p className="text-muted-foreground">
        인증, 사용자, 권한 및 팀 관리를 위한 모듈 페이지입니다.
      </p>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>사용자/권한 관리 대시보드</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          사용자 목록, 역할 매핑, 로그인 이력 패널이 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
