import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectPartsPageProps = {
  params: { key: string };
};

export default function ProjectPartsPage({ params }: ProjectPartsPageProps) {
  const { key } = params;

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{key.toUpperCase()} Parts</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>부품/BOM 관리(예정)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          부품 목록, BOM 트리, 리비전 이력 UI가 이 영역에 배치될 예정입니다.
        </CardContent>
      </Card>
    </div>
  );
}
