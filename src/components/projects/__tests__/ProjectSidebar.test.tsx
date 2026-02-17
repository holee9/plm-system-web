// ProjectSidebar Component Tests
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectSidebar } from "../ProjectSidebar";

describe("ProjectSidebar", () => {
  const mockProject = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Project",
    key: "TEST01",
    description: "A test project",
    status: "active" as const,
    visibility: "private" as const,
    teamId: null,
    createdBy: "user123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render project name and key", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("TEST01")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
    expect(screen.getByText("Parts")).toBeInTheDocument();
    expect(screen.getByText("Changes")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Milestones")).toBeInTheDocument();
    expect(screen.getByText("Labels")).toBeInTheDocument();
  });

  it("should highlight active link based on currentPath", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("bg-accent");
  });

  it("should render link to issues page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const issuesLink = screen.getByText("Issues").closest("a");
    expect(issuesLink?.getAttribute("href")).toBe("/projects/TEST01/issues");
  });

  it("should render link to parts page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const partsLink = screen.getByText("Parts").closest("a");
    expect(partsLink?.getAttribute("href")).toBe("/projects/TEST01/parts");
  });

  it("should render link to changes page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const changesLink = screen.getByText("Changes").closest("a");
    expect(changesLink?.getAttribute("href")).toBe("/projects/TEST01/changes");
  });

  it("should render link to members page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const membersLink = screen.getByText("Members").closest("a");
    expect(membersLink?.getAttribute("href")).toBe("/projects/TEST01/members");
  });

  it("should render link to settings page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink?.getAttribute("href")).toBe("/projects/TEST01/settings");
  });

  it("should render link to milestones page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const milestonesLink = screen.getByText("Milestones").closest("a");
    expect(milestonesLink?.getAttribute("href")).toBe("/projects/TEST01/milestones");
  });

  it("should render link to labels page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const labelsLink = screen.getByText("Labels").closest("a");
    expect(labelsLink?.getAttribute("href")).toBe("/projects/TEST01/labels");
  });

  it("should render link to board page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const boardLink = screen.getByText("Board").closest("a");
    expect(boardLink?.getAttribute("href")).toBe("/projects/TEST01/board");
  });

  it("should not highlight inactive links", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/dashboard" />);

    const issuesLink = screen.getByText("Issues").closest("a");
    // Check that it doesn't have the active class (exact match, not including hover states)
    expect(issuesLink?.className).not.toContain("bg-accent text-accent-foreground");
  });

  it("should highlight settings when on settings page", () => {
    render(<ProjectSidebar project={mockProject} currentPath="/projects/TEST01/settings" />);

    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink?.className).toContain("bg-accent");
  });
});
