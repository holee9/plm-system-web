/**
 * Custom Dashboard Integration Tests
 * Test the custom dashboard feature end-to-end
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CustomDashboardClient } from "~/app/projects/[key]/dashboard/custom/custom-dashboard-client";
import { trpc } from "~/lib/trpc";

// Mock tRPC
vi.mock("~/lib/trpc", () => ({
  trpc: {
    dashboard: {
      listDashboards: {
        useQuery: vi.fn(),
      },
      createDashboard: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
      deleteDashboard: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
      updateDashboard: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
      addWidget: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
      removeWidget: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
      updateWidget: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
    },
  },
}));

describe("Custom Dashboard", () => {
  const mockProjectId = "test-project-id";
  const mockProjectKey = "test-project";

  const mockDashboards = [
    {
      id: "dashboard-1",
      name: "My Dashboard",
      userId: "user-1",
      projectId: mockProjectId,
      layout: {
        columns: 12,
        rows: 1,
        widgets: [
          {
            id: "widget-1",
            type: "stat",
            position: { x: 0, y: 0 },
            size: { w: 3, h: 2 },
            config: { title: "Total Issues", metric: "totalIssues" },
          },
        ],
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeAll(() => {
    // Setup mock responses
    (trpc.dashboard.listDashboards.useQuery as any).mockReturnValue({
      data: mockDashboards,
      isLoading: false,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should render custom dashboard page", async () => {
    render(
      <CustomDashboardClient
        projectId={mockProjectId}
        projectKey={mockProjectKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Custom Dashboard")).toBeInTheDocument();
    });
  });

  it("should display dashboard tabs", async () => {
    render(
      <CustomDashboardClient
        projectId={mockProjectId}
        projectKey={mockProjectKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("My Dashboard")).toBeInTheDocument();
    });
  });

  it("should display widgets in the dashboard", async () => {
    render(
      <CustomDashboardClient
        projectId={mockProjectId}
        projectKey={mockProjectKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Total Issues")).toBeInTheDocument();
    });
  });

  it("should show loading state while fetching dashboards", () => {
    (trpc.dashboard.listDashboards.useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <CustomDashboardClient
        projectId={mockProjectId}
        projectKey={mockProjectKey}
      />
    );

    // Should render skeleton
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should show empty state when no dashboards exist", async () => {
    (trpc.dashboard.listDashboards.useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <CustomDashboardClient
        projectId={mockProjectId}
        projectKey={mockProjectKey}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No Custom Dashboards")).toBeInTheDocument();
      expect(screen.getByText("Create your first custom dashboard")).toBeInTheDocument();
    });
  });
});
