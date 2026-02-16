// Labels Page
import { LabelList } from "@/components/label/LabelList";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function LabelsPage({ params }: PageProps) {
  const { key } = await params;

  return <LabelList projectId={key} />;
}
