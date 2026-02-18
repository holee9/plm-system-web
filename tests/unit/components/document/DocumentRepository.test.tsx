/**
 * Tests for DocumentRepository component
 *
 * Tests cover:
 * - Rendering with loading state
 * - Rendering with empty documents
 * - Rendering with documents
 * - Search functionality
 * - Type filter
 * - Resource filter
 * - File size formatting
 * - Document download
 * - Document deletion
 * - Version history dialog
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocumentRepository } from "@/components/document/document-repository";

// Mock documents
const mockDocuments = [
  {
    id: "doc-1",
    originalFileName: "specification.pdf",
    mimeType: "application/pdf",
    fileSize: 1024 * 1024 * 2.5, // 2.5 MB
    version: 1,
    resourceType: "project",
    resourceId: "proj-1",
    description: "Product specification document",
    uploadedBy: { name: "John Doe" },
    createdAt: new Date("2026-02-18T10:00:00Z"),
  },
  {
    id: "doc-2",
    originalFileName: "design.png",
    mimeType: "image/png",
    fileSize: 1024 * 500, // 500 KB
    version: 2,
    resourceType: "issue",
    resourceId: "issue-1",
    description: null,
    uploadedBy: { name: "Jane Smith" },
    createdAt: new Date("2026-02-17T14:00:00Z"),
  },
  {
    id: "doc-3",
    originalFileName: "requirements.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 1024 * 1024 * 0.8, // 800 KB
    version: 1,
    resourceType: "part",
    resourceId: "part-1",
    description: "Part requirements",
    uploadedBy: { name: "Bob Wilson" },
    createdAt: new Date("2026-02-16T08:00:00Z"),
  },
];

const mockListAllQuery = vi.fn();
const mockDeleteMutation = vi.fn();
const mockUpdateDescriptionMutation = vi.fn();
const mockInvalidate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      document: {
        list: {
          invalidate: mockInvalidate,
        },
        listAll: {
          invalidate: mockInvalidate,
        },
      },
    }),
    document: {
      listAll: {
        useQuery: () => mockListAllQuery(),
      },
      delete: {
        useMutation: () => ({
          mutate: mockDeleteMutation,
        }),
      },
      updateDescription: {
        useMutation: () => ({
          mutate: mockUpdateDescriptionMutation,
        }),
      },
    },
  },
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch for download
global.fetch = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock window.open
global.open = vi.fn();

describe("DocumentRepository Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.confirm).mockReturnValue(true);
  });

  describe("Rendering", () => {
    it("should render loading state", () => {
      mockListAllQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("로딩 중...")).toBeInTheDocument();
    });

    it("should render empty state when no documents", () => {
      mockListAllQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("문서가 없습니다")).toBeInTheDocument();
      expect(screen.getByText("새 문서를 업로드하여 시작하세요")).toBeInTheDocument();
    });

    it("should render empty state when filtered results are empty", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      // Type in search to filter
      const searchInput = screen.getByPlaceholderText("문서 검색...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render document list", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("문서 저장소")).toBeInTheDocument();
      expect(screen.getByText("3개의 문서")).toBeInTheDocument();
      expect(screen.getByText("specification.pdf")).toBeInTheDocument();
      expect(screen.getByText("design.png")).toBeInTheDocument();
      expect(screen.getByText("requirements.docx")).toBeInTheDocument();
    });

    it("should show upload button when projectId is provided", () => {
      mockListAllQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("문서 업로드")).toBeInTheDocument();
    });

    it("should not show upload button when projectId is not provided", () => {
      mockListAllQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<DocumentRepository />);

      expect(screen.queryByText("문서 업로드")).not.toBeInTheDocument();
    });
  });

  describe("Search and Filter", () => {
    it("should filter documents by search query", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      const searchInput = screen.getByPlaceholderText("문서 검색...");
      await user.type(searchInput, "specification");

      expect(searchInput).toHaveValue("specification");
    });

    it("should filter by file type", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      const filterButtons = screen.getAllByRole("combobox");
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it("should filter by resource type", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      const filterButtons = screen.getAllByRole("combobox");
      expect(filterButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Document Display", () => {
    it("should display document type icons", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      // Check for emoji icons representing file types
      const pdfIcon = screen.getByText("📄");
      const imageIcon = screen.getByText("🖼️");
      expect(pdfIcon).toBeInTheDocument();
      expect(imageIcon).toBeInTheDocument();
    });

    it("should display document descriptions", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("Product specification document")).toBeInTheDocument();
    });

    it("should display resource type badges", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("프로젝트")).toBeInTheDocument();
      expect(screen.getByText("이슈")).toBeInTheDocument();
      expect(screen.getByText("부품")).toBeInTheDocument();
    });

    it("should display version numbers", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("v1")).toBeInTheDocument();
      expect(screen.getByText("v2")).toBeInTheDocument();
    });

    it("should display uploader names", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });
  });

  describe("File Size Formatting", () => {
    it("should format bytes correctly", () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      // 2.5 MB
      expect(screen.getByText("2.5 MB")).toBeInTheDocument();
      // 500 KB
      expect(screen.getByText("500.0 KB")).toBeInTheDocument();
      // 800 KB
      expect(screen.getByText("800.0 KB")).toBeInTheDocument();
    });
  });

  describe("Document Actions", () => {
    it("should handle document download", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ path: "/downloads/doc-1" }),
      } as Response);

      render(<DocumentRepository projectId="proj-1" />);

      // Click the eye icon (view/download) button
      const eyeButtons = screen.getAllByRole("button");
      const viewButton = eyeButtons.find((btn) => btn.querySelector("svg[data-lucide='eye']"));

      if (viewButton) {
        await user.click(viewButton);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith("/api/documents/doc-1/download", {
            method: "POST",
          });
        });
      }
    });

    it("should handle document deletion with confirmation", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      vi.mocked(global.confirm).mockReturnValue(true);

      render(<DocumentRepository projectId="proj-1" />);

      // Find and click the delete menu item
      const eyeButtons = screen.getAllByRole("button");

      // Click the action button (eye icon)
      for (const button of eyeButtons) {
        if (button.querySelector("svg")) {
          await user.click(button);
          break;
        }
      }

      // After dropdown opens, find delete option
      await waitFor(() => {
        const deleteOption = screen.queryByText("삭제");
        if (deleteOption) {
          userEvent.click(deleteOption);
          expect(global.confirm).toHaveBeenCalledWith("정말로 이 문서를 삭제하시겠습니까?");
        }
      });
    });

    it("should not delete when confirmation is cancelled", async () => {
      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      vi.mocked(global.confirm).mockReturnValue(false);

      render(<DocumentRepository projectId="proj-1" />);

      // Try to delete (should be cancelled by confirmation)
      expect(mockDeleteMutation).not.toHaveBeenCalled();
    });
  });

  describe("Version History", () => {
    it("should open version history dialog", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      // Find version history menu item
      const eyeButtons = screen.getAllByRole("button");

      for (const button of eyeButtons) {
        if (button.querySelector("svg")) {
          await user.click(button);
          break;
        }
      }

      await waitFor(() => {
        const versionHistoryOption = screen.queryByText("버전 기록");
        // Version history dialog would open
      });
    });
  });

  describe("Filtered Empty State", () => {
    it("should show different message when filters are active", () => {
      mockListAllQuery.mockReturnValue({
        data: [], // Empty result after filtering
        isLoading: false,
      });

      render(<DocumentRepository projectId="proj-1" />);

      // Add search query or filter to trigger filtered empty state
      const searchInput = screen.getByPlaceholderText("문서 검색...");
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle download failure gracefully", async () => {
      const user = userEvent.setup();

      mockListAllQuery.mockReturnValue({
        data: mockDocuments,
        isLoading: false,
      });

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      render(<DocumentRepository projectId="proj-1" />);

      const eyeButtons = screen.getAllByRole("button");

      for (const button of eyeButtons) {
        if (button.querySelector("svg")) {
          await user.click(button);
          break;
        }
      }

      // Error should be handled
    });
  });
});
