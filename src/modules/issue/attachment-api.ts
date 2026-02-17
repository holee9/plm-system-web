// Issue Attachment API Routes
// This file provides Next.js API route handlers for file uploads
// with multipart/form-data support

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
 * Upload a new attachment with multipart/form-data support
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { issueId: string } }
) {
  try {
    const { issueId } = params;

    // Parse multipart/form-data
    const formData = await request.formData();

    // Get file from form data
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a file." },
        { status: 400 }
      );
    }

    // Validate file size
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type using service layer
    try {
      attachmentService.validateMimeType(file.type);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create attachment record
    const attachment = await attachmentService.uploadAttachment(
      issueId,
      file.name,
      file.size,
      file.type,
      TEST_USER_ID
    );

    // Save file to disk
    await attachmentUtils.saveUploadedFile(attachment.fileName, buffer);

    return NextResponse.json(
      {
        attachment: {
          id: attachment.id,
          originalFileName: attachment.originalFileName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          uploadedAt: attachment.uploadedAt,
        },
      },
      { status: 201 }
    );
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
