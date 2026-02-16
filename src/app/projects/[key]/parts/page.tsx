// Parts List Page
import { PartList } from "@/components/plm/PartList";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function PartsPage({ params }: PageProps) {
  const { key } = await params;

  return <PartList projectId={key} />;
}
