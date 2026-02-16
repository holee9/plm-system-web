// Part Detail Page
import { PartDetail } from "@/components/plm/PartDetail";

interface PageProps {
  params: Promise<{ key: string; id: string }>;
}

export default async function PartDetailPage({ params }: PageProps) {
  const { key, id } = await params;

  return <PartDetail projectId={key} partId={id} />;
}
