/**
 * Document Preview Component Tests
 * Tests for PDF and image preview functionality
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DocumentPreview } from "../document-preview";

// Mock PDF.js
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 3,
      getPage: vi.fn((pageNum) =>
        Promise.resolve({
          viewport: { width: 800, height: 600 },
          getViewport: vi.fn(() => ({ width: 800, height: 600 })),
          render: vi.fn(() => ({ promise: Promise.resolve() })),
        })
      ),
    }),
  })),
  GlobalWorkerOptions: { workerSrc: "" },
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    document: {
      getById: {
        useQuery: vi.fn(() => ({ data: null, isLoading: false })),
      },
    },
    useUtils: vi.fn(() => ({
      document: {
        getById: { invalidate: vi.fn() },
      },
    })),
  },
}));

describe("DocumentPreview", () => {
  const mockDocument = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    originalFileName: "test.pdf",
    mimeType: "application/pdf",
    storagePath: "/uploads/test.pdf",
    fileSize: 1024,
    version: 1,
    isLatest: true,
    description: "Test PDF document",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PDF Preview", () => {
    it("should render PDF viewer component", async () => {
      const { getByText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        expect(getByText(/loading/i)).toBeInTheDocument();
      });
    });

    it("should display page navigation controls", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const nextPageButton = getByLabelText(/next page/i);
        const prevPageButton = getByLabelText(/previous page/i);
        expect(nextPageButton).toBeInTheDocument();
        expect(prevPageButton).toBeInTheDocument();
      });
    });

    it("should display zoom controls", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const zoomInButton = getByLabelText(/zoom in/i);
        const zoomOutButton = getByLabelText(/zoom out/i);
        expect(zoomInButton).toBeInTheDocument();
        expect(zoomOutButton).toBeInTheDocument();
      });
    });

    it("should display document metadata", async () => {
      const { getByText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        expect(getByText(mockDocument.originalFileName)).toBeInTheDocument();
        expect(getByText(/test pdf document/i)).toBeInTheDocument();
      });
    });
  });

  describe("Image Preview", () => {
    const mockImageDocument = {
      ...mockDocument,
      originalFileName: "test.png",
      mimeType: "image/png",
    };

    it("should render image preview", async () => {
      const { getByAltText } = render(
        <DocumentPreview documentId={mockImageDocument.id} />
      );

      await waitFor(() => {
        const image = getByAltText(mockImageDocument.originalFileName);
        expect(image).toBeInTheDocument();
      });
    });

    it("should display image metadata", async () => {
      const { getByText } = render(
        <DocumentPreview documentId={mockImageDocument.id} />
      );

      await waitFor(() => {
        expect(getByText(mockImageDocument.originalFileName)).toBeInTheDocument();
      });
    });
  });

  describe("Unsupported File Types", () => {
    const mockUnsupportedDocument = {
      ...mockDocument,
      originalFileName: "test.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    it("should display download option for unsupported types", async () => {
      const { getByText } = render(
        <DocumentPreview documentId={mockUnsupportedDocument.id} />
      );

      await waitFor(() => {
        expect(getByText(/preview not available/i)).toBeInTheDocument();
        expect(getByText(/download/i)).toBeInTheDocument();
      });
    });
  });

  describe("Zoom Functionality", () => {
    it("should increase zoom level when zoom in is clicked", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const zoomInButton = getByLabelText(/zoom in/i);
        zoomInButton.click();
      });

      // Verify zoom state changed
      await waitFor(() => {
        const zoomDisplay = getByLabelText(/zoom level/i);
        expect(zoomDisplay).toHaveTextContent(/125%/);
      });
    });

    it("should decrease zoom level when zoom out is clicked", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const zoomOutButton = getByLabelText(/zoom out/i);
        zoomOutButton.click();
      });

      // Verify zoom state changed
      await waitFor(() => {
        const zoomDisplay = getByLabelText(/zoom level/i);
        expect(zoomDisplay).toHaveTextContent(/75%/);
      });
    });
  });

  describe("Page Navigation", () => {
    it("should navigate to next page when next button is clicked", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const nextPageButton = getByLabelText(/next page/i);
        nextPageButton.click();
      });

      // Verify page number changed
      await waitFor(() => {
        const pageDisplay = getByLabelText(/current page/i);
        expect(pageDisplay).toHaveTextContent(/2/);
      });
    });

    it("should navigate to previous page when previous button is clicked", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const nextPageButton = getByLabelText(/next page/i);
        nextPageButton.click();
        const prevPageButton = getByLabelText(/previous page/i);
        prevPageButton.click();
      });

      // Verify page number changed back
      await waitFor(() => {
        const pageDisplay = getByLabelText(/current page/i);
        expect(pageDisplay).toHaveTextContent(/1/);
      });
    });

    it("should disable previous button on first page", async () => {
      const { getByLabelText } = render(
        <DocumentPreview documentId={mockDocument.id} />
      );

      await waitFor(() => {
        const prevPageButton = getByLabelText(/previous page/i);
        expect(prevPageButton).toBeDisabled();
      });
    });
  });
});
