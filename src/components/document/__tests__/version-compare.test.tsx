/**
 * Version Compare Component Tests
 * Tests for document version comparison functionality
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersionCompare } from "../version-compare";

// Mock react-diff-viewer-continued
vi.mock("react-diff-viewer-continued", () => ({
  __esModule: true,
  default: ({ oldValue, newValue }: any) => (
    <div data-testid="diff-viewer">
      <div data-testid="old-value">{oldValue}</div>
      <div data-testid="new-value">{newValue}</div>
    </div>
  ),
}));

// Mock trpc
const mockDocuments = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    originalFileName: "test-v1.txt",
    fileName: "test-v1.txt",
    mimeType: "text/plain",
    fileSize: 100,
    version: 1,
    isLatest: false,
    description: "Version 1",
    createdAt: new Date("2024-01-01"),
    uploadedBy: "user1",
    uploadedByName: "User 1",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174000",
    originalFileName: "test-v2.txt",
    fileName: "test-v2.txt",
    mimeType: "text/plain",
    fileSize: 150,
    version: 2,
    isLatest: true,
    description: "Version 2 - Updated content",
    createdAt: new Date("2024-01-02"),
    uploadedBy: "user2",
    uploadedByName: "User 2",
  },
];

vi.mock("@/lib/trpc", () => ({
  trpc: {
    document: {
      versions: {
        useQuery: vi.fn(() => ({ data: mockDocuments, isLoading: false })),
      },
      getById: {
        useQuery: vi.fn(({ input }) => ({
          data: mockDocuments.find((d) => d.id === input.documentId) || null,
          isLoading: false,
        })),
      },
    },
    useUtils: vi.fn(() => ({
      document: {
        versions: { invalidate: vi.fn() },
        getById: { invalidate: vi.fn() },
      },
    })),
  },
}));

describe("VersionCompare", () => {
  const mockResourceId = "project-123";
  const mockResourceType = "project" as const;
  const mockOriginalFileName = "test.txt";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render version selection dropdowns", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/base version/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/compare version/i)).toBeInTheDocument();
      });
    });

    it("should render compare button", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /compare/i })).toBeInTheDocument();
      });
    });
  });

  describe("Version Selection", () => {
    it("should populate version dropdowns with available versions", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        const baseDropdown = screen.getByLabelText(/base version/i);
        const compareDropdown = screen.getByLabelText(/compare version/i);

        expect(baseDropdown).toHaveTextContent(/version 1/i);
        expect(baseDropdown).toHaveTextContent(/version 2/i);
        expect(compareDropdown).toHaveTextContent(/version 1/i);
        expect(compareDropdown).toHaveTextContent(/version 2/i);
      });
    });

    it("should prevent selecting same version for comparison", async () => {
      const user = userEvent.setup();
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(async () => {
        const baseDropdown = screen.getByLabelText(/base version/i);
        const compareDropdown = screen.getByLabelText(/compare version/i);

        // Select version 1 for both
        await user.selectOptions(baseDropdown, "version-1");
        await user.selectOptions(compareDropdown, "version-1");

        const compareButton = screen.getByRole("button", { name: /compare/i });
        expect(compareButton).toBeDisabled();
      });
    });
  });

  describe("Diff View", () => {
    it("should display side-by-side diff view after comparison", async () => {
      const user = userEvent.setup();
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(async () => {
        const baseDropdown = screen.getByLabelText(/base version/i);
        const compareDropdown = screen.getByLabelText(/compare version/i);

        await user.selectOptions(baseDropdown, "version-1");
        await user.selectOptions(compareDropdown, "version-2");

        const compareButton = screen.getByRole("button", { name: /compare/i });
        await user.click(compareButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId("diff-viewer")).toBeInTheDocument();
      });
    });

    it("should highlight changes in diff view", async () => {
      const user = userEvent.setup();
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(async () => {
        const baseDropdown = screen.getByLabelText(/base version/i);
        const compareDropdown = screen.getByLabelText(/compare version/i);

        await user.selectOptions(baseDropdown, "version-1");
        await user.selectOptions(compareDropdown, "version-2");

        const compareButton = screen.getByRole("button", { name: /compare/i });
        await user.click(compareButton);
      });

      await waitFor(() => {
        const diffViewer = screen.getByTestId("diff-viewer");
        expect(diffViewer).toBeInTheDocument();
      });
    });
  });

  describe("Metadata Comparison", () => {
    it("should display version metadata table", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/metadata comparison/i)).toBeInTheDocument();
        expect(screen.getByText(/version 1/i)).toBeInTheDocument();
        expect(screen.getByText(/version 2/i)).toBeInTheDocument();
      });
    });

    it("should show file size differences", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/100 bytes/i)).toBeInTheDocument();
        expect(screen.getByText(/150 bytes/i)).toBeInTheDocument();
      });
    });

    it("should show uploader information", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/user 1/i)).toBeInTheDocument();
        expect(screen.getByText(/user 2/i)).toBeInTheDocument();
      });
    });

    it("should show creation dates", async () => {
      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
        expect(screen.getByText(/2024-01-02/i)).toBeInTheDocument();
      });
    });
  });

  describe("Image Comparison", () => {
    const mockImageVersions = [
      {
        ...mockDocuments[0],
        mimeType: "image/png",
      },
      {
        ...mockDocuments[1],
        mimeType: "image/png",
      },
    ];

    it("should display image slider for visual comparison", async () => {
      vi.doMock("@/lib/trpc", () => ({
        trpc: {
          document: {
            versions: {
              useQuery: vi.fn(() => ({ data: mockImageVersions, isLoading: false })),
            },
          },
        },
      }));

      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName="image.png"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("image-comparison-slider")).toBeInTheDocument();
      });
    });
  });

  describe("Change Highlighting", () => {
    it("should mark additions in green", async () => {
      const { container } = render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        const additions = container.querySelectorAll(".diff-added");
        expect(additions.length).toBeGreaterThan(0);
      });
    });

    it("should mark deletions in red", async () => {
      const { container } = render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        const deletions = container.querySelectorAll(".diff-removed");
        expect(deletions.length).toBeGreaterThan(0);
      });
    });

    it("should mark modifications in yellow", async () => {
      const { container } = render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        const modifications = container.querySelectorAll(".diff-modified");
        expect(modifications.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing versions gracefully", async () => {
      vi.doMock("@/lib/trpc", () => ({
        trpc: {
          document: {
            versions: {
              useQuery: vi.fn(() => ({ data: [], isLoading: false })),
            },
          },
        },
      }));

      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no versions available/i)).toBeInTheDocument();
      });
    });

    it("should handle version fetch errors", async () => {
      vi.doMock("@/lib/trpc", () => ({
        trpc: {
          document: {
            versions: {
              useQuery: vi.fn(() => ({
                data: null,
                isLoading: false,
                error: new Error("Failed to fetch versions"),
              })),
            },
          },
        },
      }));

      render(
        <VersionCompare
          resourceId={mockResourceId}
          resourceType={mockResourceType}
          originalFileName={mockOriginalFileName}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to load versions/i)).toBeInTheDocument();
      });
    });
  });
});
