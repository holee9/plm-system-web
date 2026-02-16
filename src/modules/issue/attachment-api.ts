// Issue Attachment API Routes
// This file provides Next.js API route handlers for file uploads
// since tRPC doesn't support multipart/form-data natively

import { NextRequest, NextResponse } from "next/server";
import * as attachmentService from "./attachment-service";
import * as attachmentUtils from "./attachment-utils";

// TODO: Replace with actual auth once implemented
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * GET /api/issues/:issueId/attachments
 * List all attachments for an issue
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  try {
    const { issueId } = params;
    const attachments = await attachmentService.listAttachments(issueId);
    return NextResponse.json({ attachments });
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

/**
 * POST /api/issues/:issueId/attachments
 * Upload a new attachment
 *
 * Note: This should be called with multipart/form-data
 * The actual file upload handler would typically use a library like `formidable` or `multer`
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  try {
    const { issueId } = params;

    // Note: For actual file upload, you would need to parse multipart/form-data
    // This is a simplified version that expects JSON metadata
    // In a real implementation, use a library like `formidable` for Next.js API routes

    const body = await request.json();
    const { originalFileName, fileSize, mimeType, fileData } = body;

    // Validate inputs
    if (!originalFileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields: originalFileName, fileSize, mimeType" },
        { status: 400 }
      );
    }

    // Create attachment record
    const attachment = await attachmentService.uploadAttachment(
      issueId,
      originalFileName,
      fileSize,
      mimeType,
      TEST_USER_ID
    );

    // Save file to disk if file data is provided
    if (fileData) {
      const buffer = Buffer.from(fileData, "base64");
      await attachmentUtils.saveUploadedFile(attachment.fileName, buffer);
    }

    return NextResponse.json({ attachment }, { status: 201 });
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

/**
 * GET /api/attachments/:id/download
 * Download an attachment file
 */
export async function getAttachmentDownload(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const attachment = await attachmentService.getAttachmentById(id);

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // In a real implementation, you would:
    // 1. Read the file from disk
    // 2. Stream it back with proper Content-Type and Content-Disposition headers
    // For now, return metadata
    return NextResponse.json({
      fileName: attachment.originalFileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      downloadUrl: `/uploads/attachments/${attachment.fileName}`,
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

/**
 * DELETE /api/attachments/:id
 * Delete an attachment
 */
export async function deleteAttachment(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get attachment before deletion to get file name
    const attachment = await attachmentService.getAttachmentById(id);
    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Delete from database (this will also check permissions)
    await attachmentService.deleteAttachment(id, TEST_USER_ID);

    // Delete file from disk
    await attachmentUtils.deleteUploadedFile(attachment.fileName);

    return NextResponse.json({ success: true });
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
