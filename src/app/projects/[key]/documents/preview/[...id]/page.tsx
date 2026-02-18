/**
 * Document Preview Page
 * Handles document preview with catch-all route for document ID
 */
import { notFound } from "next/navigation";
import { DocumentPreview } from "@/components/document/document-preview";

interface PageProps {
  params: Promise<{
    key: string;
    id: string[];
  }>;
}

export default async function DocumentPreviewPage({ params }: PageProps) {
  const { key, id } = await params;

  // Join path segments to get document ID
  const documentId = id.join("/");

  if (!documentId) {
    notFound();
  }

  return <DocumentPreview documentId={documentId} open />;
}
