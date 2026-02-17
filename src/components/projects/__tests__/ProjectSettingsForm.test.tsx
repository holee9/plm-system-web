// Unit tests for ProjectSettingsForm Component
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectSettingsForm } from "../ProjectSettingsForm";

// Mock Next.js router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock tRPC
const mockUpdateMutate = vi.fn();
const mockArchiveMutate = vi.fn();
const mockRestoreMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    project: {
      update: {
        useMutation: () => ({
          mutate: mockUpdateMutate,
          isPending: false,
        }),
      },
      archive: {
        useMutation: () => ({
          mutate: mockArchiveMutate,
          isPending: false,
        }),
      },
      restore: {
        useMutation: () => ({
          mutate: mockRestoreMutate,
          isPending: false,
        }),
      },
    },
  },
}));

// Mock RadioGroup
vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ value, onValueChange, children }: any) => (
    <div data-value={value} data-testid="radio-group">
      {children}
      <button
        onClick={() => onValueChange("private")}
        data-testid="set-private"
      >
        Set Private
      </button>
      <button
        onClick={() => onValueChange("public")}
        data-testid="set-public"
      >
        Set Public
      </button>
    </div>
  ),
  RadioGroupItem: ({ value, id }: any) => (
    <input type="radio" value={value} id={id} data-testid={`radio-${id}`} />
  ),
}));

describe("ProjectSettingsForm Component", () => {
  const mockProject = {
    id: "proj1",
    name: "Test Project",
    key: "TEST",
    description: "Test Description",
    status: "active" as const,
    visibility: "private" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
  });

  it("should render project fields with initial values", () => {
    render(<ProjectSettingsForm project={mockProject} />);

    expect(screen.getByDisplayValue("Test Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TEST")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
  });

  it("should disable project key input", () => {
    render(<ProjectSettingsForm project={mockProject} />);

    const keyInput = screen.getByDisplayValue("TEST");
    expect(keyInput).toBeDisabled();
  });

  it("should show project key cannot be changed message", () => {
    render(<ProjectSettingsForm project={mockProject} />);

    expect(screen.getByText(/Project key cannot be changed/)).toBeInTheDocument();
  });

  it("should have save changes button", () => {
    render(<ProjectSettingsForm project={mockProject} />);

    expect(screen.getByRole("button", { name: /Save Changes/ })).toBeInTheDocument();
  });

  it("should call update mutation with correct data", async () => {
    const user = userEvent.setup();
    render(<ProjectSettingsForm project={mockProject} />);

    const nameInput = screen.getByDisplayValue("Test Project");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Project");

    const saveButton = screen.getByRole("button", { name: /Save Changes/ });
    await user.click(saveButton);

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      projectId: "proj1",
      data: {
        name: "Updated Project",
        description: "Test Description",
        visibility: "private",
      },
    });
  });

  it("should show error when name is empty", async () => {
    const user = userEvent.setup();
    render(<ProjectSettingsForm project={mockProject} />);

    const nameInput = screen.getByDisplayValue("Test Project");
    await user.clear(nameInput);

    const saveButton = screen.getByRole("button", { name: /Save Changes/ });
    await user.click(saveButton);

    expect(screen.getByText("Project name is required")).toBeInTheDocument();
    expect(mockUpdateMutate).not.toHaveBeenCalled();
  });

  it("should show archive button for active projects", () => {
    render(<ProjectSettingsForm project={mockProject} />);

    expect(screen.getByRole("button", { name: /Archive Project/ })).toBeInTheDocument();
    expect(screen.getByText(/Danger Zone/)).toBeInTheDocument();
  });

  it("should show restore button for archived projects", () => {
    const archivedProject = { ...mockProject, status: "archived" as const };
    render(<ProjectSettingsForm project={archivedProject} />);

    expect(screen.getByRole("button", { name: /Restore Project/ })).toBeInTheDocument();
    expect(screen.getByText(/Restore Project/)).toBeInTheDocument();
  });

  it("should call archive mutation with confirmation", async () => {
    const user = userEvent.setup();
    render(<ProjectSettingsForm project={mockProject} />);

    const archiveButton = screen.getByRole("button", { name: /Archive Project/ });
    await user.click(archiveButton);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to archive this project?"
    );
    expect(mockArchiveMutate).toHaveBeenCalledWith({ projectId: "proj1" });
  });

  it("should call restore mutation with confirmation", async () => {
    const user = userEvent.setup();
    const archivedProject = { ...mockProject, status: "archived" as const };
    render(<ProjectSettingsForm project={archivedProject} />);

    const restoreButton = screen.getByRole("button", { name: /Restore Project/ });
    await user.click(restoreButton);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to restore this project?"
    );
    expect(mockRestoreMutate).toHaveBeenCalledWith({ projectId: "proj1" });
  });

  it("should not archive when confirmation is cancelled", async () => {
    global.confirm = vi.fn(() => false);
    const user = userEvent.setup();
    render(<ProjectSettingsForm project={mockProject} />);

    const archiveButton = screen.getByRole("button", { name: /Archive Project/ });
    await user.click(archiveButton);

    expect(mockArchiveMutate).not.toHaveBeenCalled();
  });
});
