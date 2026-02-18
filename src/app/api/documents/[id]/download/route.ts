/**
 * Document Download API Route
 * Provides secure file download with authentication
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getDocumentDownloadPath } from "@/modules/document/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: documentId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const path = await getDocumentDownloadPath(documentId, session.user.id);

    return NextResponse.json({
      success: true,
      path,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
