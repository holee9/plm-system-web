// ProjectCard Component Tests
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "../ProjectCard";

describe("ProjectCard", () => {
  const mockProject = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Project",
    key: "TEST01",
    description: "A test project description",
    status: "active" as const,
    visibility: "private" as const,
    teamId: null,
    createdBy: "user123",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  };

  it("should render project name and key", () => {
    render(<ProjectCard project={mockProject} href="/projects/TEST01" />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("TEST01")).toBeInTheDocument();
  });

  it("should render project description when provided", () => {
    render(<ProjectCard project={mockProject} href="/projects/TEST01" />);

    expect(screen.getByText("A test project description")).toBeInTheDocument();
  });

  it("should not render description when null", () => {
    const projectWithoutDesc = { ...mockProject, description: null };
    render(<ProjectCard project={projectWithoutDesc} href="/projects/TEST01" />);

    const description = screen.queryByText("A test project description");
    expect(description).not.toBeInTheDocument();
  });

  it("should render last updated date", () => {
    render(<ProjectCard project={mockProject} href="/projects/TEST01" />);

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    // The date format is locale-dependent, so just check for the year
    expect(screen.getByText(/2024/i)).toBeInTheDocument();
  });

  it("should render as a link with correct href", () => {
    const { container } = render(
      <ProjectCard project={mockProject} href="/projects/TEST01" />
    );

    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/projects/TEST01");
  });

  it("should apply active styles when isActive is true", () => {
    const { container } = render(
      <ProjectCard project={mockProject} href="/projects/TEST01" isActive />
    );

    const card = container.querySelector("a > div");
    expect(card?.className).toContain("border-primary");
  });

  it("should not apply active styles when isActive is false", () => {
    const { container } = render(
      <ProjectCard project={mockProject} href="/projects/TEST01" />
    );

    const card = container.querySelector("a > div");
    expect(card?.className).not.toContain("border-primary");
  });
});
