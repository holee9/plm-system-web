// GET /api/attachments/:id/download
// Download an attachment file with proper headers

import { NextRequest, NextResponse } from "next/server";
import * as attachmentService from "~/modules/issue/attachment-service";
import { readUploadedFile, getAttachmentFilePath } from "~/modules/issue/attachment-utils";
import { existsSync } from "node:fs";
import { getIssueById, isUserProjectMember } from "~/modules/issue/service";
import { verifyAccessToken } from "~/utils/jwt";
import { cookies } from "next/headers";

/**
 * Get current user ID from JWT access token in cookies
 * @returns User ID if authenticated, null otherwise
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await verifyAccessToken(accessToken);
    return payload.sub;
  } catch {
    return null;
  }
}

/**
 * GET /api/attachments/:id/download
 * Download an attachment file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Verify user has access to parent issue (Security Check)
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다. 로그인해 주세요." },
        { status: 401 }
      );
    }

    const isMember = await isUserProjectMember(issue.projectId, userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "이 첨부파일에 접근할 권한이 없습니다." },
        { status: 403 }
      );
    }

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

    // Convert Buffer to Uint8Array for NextResponse (proper BodyInit type)
    const uint8Array = new Uint8Array(fileBuffer);

    // Return file as response
    return new NextResponse(uint8Array, {
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
