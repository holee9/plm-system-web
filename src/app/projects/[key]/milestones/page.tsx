// Milestones Page
import { MilestoneList } from "@/components/milestone/MilestoneList";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function MilestonesPage({ params }: PageProps) {
  const { key } = await params;

  return <MilestoneList projectId={key} />;
}
