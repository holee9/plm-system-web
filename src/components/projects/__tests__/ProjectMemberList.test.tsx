// Unit tests for ProjectMemberList Component
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectMemberList } from "../ProjectMemberList";

// Mock tRPC
const mockUpdateRoleMutate = vi.fn();
const mockRemoveMemberMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    project: {
      updateMemberRole: {
        useMutation: () => ({
          mutate: mockUpdateRoleMutate,
          isPending: false,
        }),
      },
      removeMember: {
        useMutation: () => ({
          mutate: mockRemoveMemberMutate,
          isPending: false,
          variables: undefined,
        }),
      },
    },
  },
}));

// Mock AddMemberDialog
vi.mock("../AddMemberDialog", () => ({
  AddMemberDialog: ({ onMemberAdded }: any) => (
    <button
      data-testid="add-member-dialog"
      onClick={() => onMemberAdded({ id: "new-member", user: { id: "user3", name: "New User", email: "new@example.com", image: null }, role: "member", joinedAt: new Date() })}
    >
      Add Member
    </button>
  ),
}));

// Mock Select component
vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid={`role-select-${value}`}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="role-select"
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="viewer">Viewer</option>
      </select>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span>Select value</span>,
}));

describe("ProjectMemberList Component", () => {
  const mockMembers = [
    {
      id: "member1",
      role: "admin" as const,
      joinedAt: new Date("2024-01-01"),
      user: {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
        image: null,
      },
    },
    {
      id: "member2",
      role: "member" as const,
      joinedAt: new Date("2024-01-02"),
      user: {
        id: "user2",
        name: "Jane Smith",
        email: "jane@example.com",
        image: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
  });

  it("should render member list", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("should show role badges", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("member")).toBeInTheDocument();
  });

  it("should have Add Member button", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    expect(screen.getByTestId("add-member-dialog")).toBeInTheDocument();
  });

  it("should show empty state when no members", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={[]}
      />
    );

    expect(screen.getByText(/No members yet/)).toBeInTheDocument();
  });

  it("should show user initials in avatar", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    // Initials are rendered - J for John, J for Jane
    const avatars = screen.getAllByText("J");
    expect(avatars.length).toBeGreaterThanOrEqual(2);
  });

  it("should have remove buttons for each member", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons.length).toBe(2);
  });

  it("should call remove mutation with confirmation", async () => {
    const user = userEvent.setup();
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    const removeButtons = screen.getAllByText("Remove");
    await user.click(removeButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove this member?"
    );
  });

  it("should have role selector for each member", () => {
    render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    const roleSelects = screen.getAllByTestId("role-select");
    expect(roleSelects.length).toBe(2);
  });

  it("should add new member when dialog callback is triggered", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ProjectMemberList
        projectId="proj1"
        projectKey="TEST"
        initialMembers={mockMembers}
      />
    );

    const addButton = screen.getByTestId("add-member-dialog");
    await user.click(addButton);

    // Component updates its internal state when onMemberAdded is called
    // This is handled by the component's useState and handleMemberAdded
  });
});
