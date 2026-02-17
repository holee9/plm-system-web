// Unit tests for ProjectList Component
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectList } from "../ProjectList";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    project: {
      list: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Mock ProjectCard
vi.mock("../ProjectCard", () => ({
  ProjectCard: ({
    project,
    href,
  }: {
    project: { id: string; name: string; key: string };
    href: string;
  }) => (
    <a href={href} data-testid={`project-${project.id}`}>
      {project.name} ({project.key})
    </a>
  ),
}));

import { trpc } from "@/lib/trpc";

describe("ProjectList Component", () => {
  it("should show loading state initially", () => {
    vi.mocked(trpc.project.list.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isRefetching: false,
      status: "pending",
      fetchStatus: "idle",
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      refetch: vi.fn(),
    } as any);

    render(<ProjectList />);
    expect(screen.getByText(/Loading projects/i)).toBeInTheDocument();
  });

  it("should show empty state when no projects", () => {
    vi.mocked(trpc.project.list.useQuery).mockReturnValue({
      data: { projects: [], total: 0 },
      isLoading: false,
      error: null,
      isRefetching: false,
      status: "success",
      fetchStatus: "idle",
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      refetch: vi.fn(),
    } as any);

    render(<ProjectList />);
    expect(screen.getByText(/You don't have any projects yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your first project/i)).toBeInTheDocument();
  });

  it("should render project cards when projects exist", () => {
    const mockProjects = {
      projects: [
        { id: "1", name: "Project One", key: "PROJ1", description: null, status: "active", createdAt: new Date(), updatedAt: new Date() },
        { id: "2", name: "Project Two", key: "PROJ2", description: null, status: "active", createdAt: new Date(), updatedAt: new Date() },
      ],
      total: 2,
    };

    vi.mocked(trpc.project.list.useQuery).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
      isRefetching: false,
      status: "success",
      fetchStatus: "idle",
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      refetch: vi.fn(),
    } as any);

    render(<ProjectList />);
    expect(screen.getByTestId("project-1")).toBeInTheDocument();
    expect(screen.getByTestId("project-2")).toBeInTheDocument();
  });

  it("should render header with title and description", () => {
    vi.mocked(trpc.project.list.useQuery).mockReturnValue({
      data: { projects: [], total: 0 },
      isLoading: false,
      error: null,
      isRefetching: false,
      status: "success",
      fetchStatus: "idle",
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      refetch: vi.fn(),
    } as any);

    render(<ProjectList />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText(/Manage your projects and collaborate/i)).toBeInTheDocument();
  });

  it("should have New Project link", () => {
    vi.mocked(trpc.project.list.useQuery).mockReturnValue({
      data: { projects: [], total: 0 },
      isLoading: false,
      error: null,
      isRefetching: false,
      status: "success",
      fetchStatus: "idle",
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      refetch: vi.fn(),
    } as any);

    render(<ProjectList />);
    const newProjectLinks = screen.getAllByText("New Project");
    expect(newProjectLinks.length).toBeGreaterThan(0);
  });
});
