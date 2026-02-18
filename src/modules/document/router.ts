/**
 * Document tRPC Router
 * Exposes file upload, download, and version management procedures
 */
import { z } from "zod";
import { router as createTRPCRouter, protectedProcedure } from "~/server/trpc";
import type { AuthenticatedContext } from "~/server/trpc/middleware/is-authed";
import * as documentService from "./service";

const resourceTypeEnum = z.enum(["issue", "part", "change_order", "project", "milestone"]);

// Allowed MIME types for file upload
const ALLOWED_MIME_TYPES = [
  // PDF
  "application/pdf",
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Microsoft Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Microsoft Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Microsoft PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

// MIME type validation schema
const mimeTypeSchema = z.string().refine(
  (value) => {
    // Check if MIME type matches allowed patterns
    const allowedPatterns = [
      /^application\/pdf$/,
      /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/,
      /^application\/msword$/,
      /^application\/vnd\.openxmlformats-officedocument\.(wordprocessingml|spreadsheetml|presentationml)\.document$/,
      /^application\/vnd\.ms-(excel|powerpoint)$/,
      /^text\/(plain|csv)$/,
      /^application\/(zip|x-zip-compressed|x-rar-compressed|x-7z-compressed)$/,
    ];

    return allowedPatterns.some((pattern) => pattern.test(value));
  },
  {
    message: "Invalid file type. Allowed types: PDF, images, Office documents, text files, and archives.",
  }
);

export const documentRouter = createTRPCRouter({
  // Upload/attach document to resource
  upload: protectedProcedure
    .input(
      z.object({
        resourceId: z.string().uuid(),
        resourceType: resourceTypeEnum,
        originalFileName: z.string().min(1).max(500),
        mimeType: mimeTypeSchema,
        fileSize: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
        storagePath: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const authCtx = ctx as AuthenticatedContext;
        const document = await documentService.uploadDocument({
          ...input,
          uploadedBy: authCtx.user.id,
        });

        return {
          success: true,
          data: document,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to upload document");
      }
    }),

  // Get document by ID
  getById: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ input }) => {
      const document = await documentService.getDocumentById(input.documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      return document;
    }),

  // List documents for a resource (latest versions only)
  list: protectedProcedure
    .input(
      z.object({
        resourceId: z.string().uuid(),
        resourceType: resourceTypeEnum,
      })
    )
    .query(async ({ input }) => {
      return documentService.listDocumentsForResource(
        input.resourceId,
        input.resourceType
      );
    }),

  // Get all documents for a resource including all versions
  listAll: protectedProcedure
    .input(
      z.object({
        resourceId: z.string().uuid(),
        resourceType: resourceTypeEnum,
      })
    )
    .query(async ({ input }) => {
      return documentService.getAllDocumentsForResource(
        input.resourceId,
        input.resourceType
      );
    }),

  // Get all versions of a specific document
  versions: protectedProcedure
    .input(
      z.object({
        resourceId: z.string().uuid(),
        resourceType: resourceTypeEnum,
        originalFileName: z.string(),
      })
    )
    .query(async ({ input }) => {
      return documentService.getDocumentVersions(
        input.resourceId,
        input.resourceType,
        input.originalFileName
      );
    }),

  // Delete document
  delete: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const authCtx = ctx as AuthenticatedContext;
        await documentService.deleteDocument(input.documentId, authCtx.user.id);

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to delete document");
      }
    }),

  // Update document description
  updateDescription: protectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const authCtx = ctx as AuthenticatedContext;
        const document = await documentService.updateDocumentDescription(
          input.documentId,
          input.description,
          authCtx.user.id
        );

        return {
          success: true,
          data: document,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to update document");
      }
    }),

  // Get download path for document
  downloadPath: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const authCtx = ctx as AuthenticatedContext;
        const path = await documentService.getDocumentDownloadPath(
          input.documentId,
          authCtx.user.id
        );

        return {
          path,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Failed to get download path");
      }
    }),
});
