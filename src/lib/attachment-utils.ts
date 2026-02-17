// Client-side attachment utilities

/**
 * Format file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file icon based on MIME type
 * @param mimeType - File MIME type
 * @returns Emoji icon representing the file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "🖼️";
  }
  if (mimeType === "application/pdf") {
    return "📄";
  }
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("msword")
  ) {
    return "📝";
  }
  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("sheet")
  ) {
    return "📊";
  }
  if (
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation")
  ) {
    return "📽️";
  }
  if (mimeType.startsWith("text/")) {
    return "📃";
  }
  if (mimeType === "application/json") {
    return "{ }";
  }
  return "📎";
}

/**
 * Trigger file download from URL
 * @param url - Download URL
 * @param filename - Suggested filename for download
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get blob from response
    const blob = await response.blob();

    // Create object URL
    const objectUrl = URL.createObjectURL(blob);

    // Create temporary link element
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension (e.g., ".pdf", ".jpg")
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  return filename.slice(lastDotIndex).toLowerCase();
}

/**
 * Check if file type is allowed
 * @param mimeType - File MIME type
 * @returns True if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text
    "text/plain",
    "text/csv",
    "application/json",
    "application/xml",
    "text/xml",
  ];

  return allowedTypes.includes(mimeType);
}

/**
 * Validate file for upload
 * @param file - File to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateFileForUpload(
  file: File
): { isValid: boolean; error?: string } {
  // Check file size (10MB limit)
  const maxFileSize = 10 * 1024 * 1024;
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!isAllowedFileType(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return { isValid: true };
}
