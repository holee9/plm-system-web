# Issue Attachment System Implementation

## Overview

This implementation provides a complete attachment system for issues, allowing users to upload, download, list, and delete files attached to issues.

## Architecture

### Components

1. **Database Schema** (`src/modules/issue/schemas/issue-attachments.ts`)
   - `issue_attachments` table definition
   - Fields: id, issueId, fileName, originalFileName, fileSize, mimeType, uploadedBy, uploadedAt
   - Indexes for efficient queries

2. **Service Layer** (`src/modules/issue/attachment-service.ts`)
   - Business logic for attachment operations
   - Validation functions (file size, MIME type)
   - Permission checks (uploader, project admin)
   - Database operations

3. **File Storage Utilities** (`src/modules/issue/attachment-utils.ts`)
   - File system operations
   - Directory management
   - File I/O operations

4. **tRPC Router** (`src/modules/issue/router.ts`)
   - `attachment.upload` - Upload attachment metadata
   - `attachment.list` - List issue attachments
   - `attachment.getById` - Get attachment by ID
   - `attachment.delete` - Delete attachment

5. **API Routes** (`src/modules/issue/attachment-api.ts`)
   - Next.js API routes for file uploads
   - Handles multipart/form-data (with proper implementation)
   - File download endpoints

## Database Schema

```sql
CREATE TABLE issue_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,        -- UUID_prefix + original name
  original_file_name VARCHAR(255) NOT NULL, -- User-provided name
  file_size BIGINT NOT NULL,               -- Size in bytes
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX issue_attachments_issue_idx ON issue_attachments(issue_id);
CREATE INDEX issue_attachments_uploaded_by_idx ON issue_attachments(uploaded_by);
```

## Usage

### tRPC API

#### Upload Attachment

```typescript
const attachment = await trpc.issue.attachment.upload.mutate({
  issueId: "issue-uuid",
  originalFileName: "document.pdf",
  fileSize: 1234567,
  mimeType: "application/pdf",
});
```

#### List Attachments

```typescript
const attachments = await trpc.issue.attachment.list.query({
  issueId: "issue-uuid",
});
```

#### Get Attachment

```typescript
const attachment = await trpc.issue.attachment.getById.query({
  id: "attachment-uuid",
});
```

#### Delete Attachment

```typescript
await trpc.issue.attachment.delete.mutate({
  id: "attachment-uuid",
});
```

### HTTP API (for file uploads)

#### Upload File

```
POST /api/issues/:issueId/attachments
Content-Type: multipart/form-data

file: <binary>
```

#### Download File

```
GET /api/attachments/:id/download
```

#### Delete File

```
DELETE /api/attachments/:id
```

## Validation Rules

### File Size
- Maximum: 10MB per file
- Minimum: 1 byte

### File Types (MIME Types)
- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Text**: TXT, CSV, JSON, XML

### Attachment Limits
- Maximum: 10 attachments per issue
- Filenames: UUID prefix to prevent conflicts

## Permissions

### Upload
- Must be a project member

### Delete
- Must be the uploader OR a project admin

### Download/List
- Must be a project member

## File Storage

### Directory Structure
```
public/
  uploads/
    attachments/
      {uuid}_original-filename.pdf
      {uuid}_screenshot.png
      ...
```

### File Naming
- Format: `{UUID}_{original-filename}`
- Example: `a1b2c3d4-report.pdf`

## Error Handling

### Validation Errors
- `AttachmentValidationError` - Invalid input (file size, type, etc.)

### Access Errors
- `AttachmentAccessError` - Permission denied

### Not Found Errors
- `AttachmentNotFoundError` - Attachment doesn't exist

## Constants

```typescript
MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
MAX_ATTACHMENTS_PER_ISSUE = 10
```

## Implementation Notes

### File Upload Flow

1. Client uploads file via HTTP API
2. Server validates file (size, type)
3. Server saves file to disk
4. Server creates database record
5. Server returns attachment metadata

### File Download Flow

1. Client requests download via HTTP API
2. Server verifies permissions
3. Server streams file from disk
4. Client receives file with original filename

### File Deletion Flow

1. Client requests deletion
2. Server verifies permissions
3. Server deletes database record
4. Server deletes file from disk

## TODO

### Current Implementation
- Database schema complete
- Service layer complete
- tRPC router complete
- Basic file storage utilities complete

### Future Enhancements
- Implement proper multipart/form-data parsing in Next.js
- Add file virus scanning
- Add image thumbnails
- Add file preview for images/PDFs
- Add batch upload support
- Add attachment categories/tags
- Implement CDN integration
- Add file versioning
- Add expiration/cleanup policies

### Authentication
- Current: Uses test user ID
- TODO: Integrate with actual authentication system
- Replace `TEST_USER_ID` with `ctx.user.id`

## Testing

### Unit Tests
```typescript
// Test file size validation
expect(() => validateFileSize(MAX_FILE_SIZE + 1)).toThrow();

// Test MIME type validation
expect(() => validateMimeType("application/x-executable")).toThrow();

// Test attachment limit
await checkAttachmentLimit(issueId); // Should throw if limit reached
```

### Integration Tests
```typescript
// Test upload flow
const attachment = await uploadAttachment(...);
expect(attachment.id).toBeDefined();

// Test deletion
await deleteAttachment(attachment.id, userId);
const deleted = await getAttachmentById(attachment.id);
expect(deleted).toBeNull();
```

## Security Considerations

1. **File Type Validation**
   - MIME type whitelist enforcement
   - File extension validation
   - Content-type verification

2. **Access Control**
   - Project membership verification
   - Admin/uploader-only deletion
   - Issue access checks

3. **File Storage**
   - UUID filename prefix prevents path traversal
   - Files stored outside web root (when configured)
   - Separate upload directory

4. **Rate Limiting**
   - TODO: Add upload rate limiting
   - TODO: Add file size quotas per user/project

## Performance Considerations

1. **Database Indexes**
   - Indexed on `issueId` for fast listing
   - Indexed on `uploadedBy` for user queries

2. **File Streaming**
   - TODO: Implement streaming for large files
   - TODO: Add range request support

3. **Caching**
   - TODO: Cache attachment metadata
   - TODO: Implement CDN caching
