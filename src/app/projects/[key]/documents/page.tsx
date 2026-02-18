// Documents Page for Project
import { DocumentRepository } from "@/components/document/document-repository";

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function DocumentsPage({ params }: PageProps) {
  const { key } = await params;

  return <DocumentRepository projectId={key} />;
}
