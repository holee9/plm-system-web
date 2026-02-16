import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlmPage() {
  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">PLM</h1>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>
      <p className="text-muted-foreground">
        BOM, 부품, 변경 주문(ECR/ECN) 관리 기능을 위한 모듈 페이지입니다.
      </p>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>제품 수명주기 작업 영역</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          부품 트리, 리비전 히스토리, 변경 승인 플로우 UI가 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
