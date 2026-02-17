// GET /api/attachments/:id/download
// Download an attachment file with proper headers

import { NextRequest, NextResponse } from "next/server";
import * as attachmentService from "~/modules/issue/attachment-service";
import { readUploadedFile, getAttachmentFilePath } from "~/modules/issue/attachment-utils";
import { existsSync } from "node:fs";
import { getIssueById } from "~/modules/issue/service";

/**
 * GET /api/attachments/:id/download
 * Download an attachment file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get attachment metadata
    const attachment = await attachmentService.getAttachmentById(id);

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Get issue to verify access
    const issue = await getIssueById(attachment.issueId);
    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    // TODO: Verify user has access to parent issue
    // For now, we'll skip auth check
    // const userId = await getCurrentUserId();
    // const isMember = await isUserProjectMember(issue.projectId, userId);
    // if (!isMember) {
    //   return NextResponse.json(
    //     { error: "You don't have permission to download this attachment" },
    //     { status: 403 }
    //   );
    // }

    // Get file path
    const filePath = getAttachmentFilePath(attachment.fileName);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    // Read file from disk
    const fileBuffer = await readUploadedFile(attachment.fileName);

    // Create headers for file download
    const headers = new Headers();
    headers.set("Content-Type", attachment.mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${attachment.originalFileName}"`
    );
    headers.set("Content-Length", fileBuffer.byteLength.toString());

    // Return file as response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
