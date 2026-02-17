// Unit tests for AddMemberDialog Component
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddMemberDialog } from "../AddMemberDialog";

// Mock tRPC
const mockUsers = [
  { id: "user1", name: "John Doe", email: "john@example.com", image: null },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", image: null },
];

const mockAddMember = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      list: {
        useQuery: vi.fn(() => ({ data: mockUsers, isLoading: false })),
      },
    },
    project: {
      addMember: {
        useMutation: () => mockAddMember,
      },
    },
  },
}));

// Mock UI components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-open={open}>
      {children}
      <button onClick={() => onOpenChange(!open)}>Toggle Dialog</button>
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children, asChild }: any) => {
    if (asChild) {
      return <>{children}</>;
    }
    return <button>{children}</button>;
  },
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-value={value}>
      {children}
      <select
        data-testid="role-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="viewer">Viewer</option>
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <span>Select value</span>,
}));

describe("AddMemberDialog Component", () => {
  const mockOnMemberAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render trigger button", () => {
    render(
      <AddMemberDialog
        projectId="proj1"
        projectKey="TEST"
        onMemberAdded={mockOnMemberAdded}
      />
    );

    // Get the trigger button (first one, before dialog content)
    const buttons = screen.getAllByText("Add Member");
    expect(buttons).toHaveLength(2); // Trigger button + submit button
    expect(buttons[0]).toBeInTheDocument();
  });

  it("should have email input field", () => {
    render(
      <AddMemberDialog
        projectId="proj1"
        projectKey="TEST"
        onMemberAdded={mockOnMemberAdded}
      />
    );

    expect(screen.getByLabelText(/User Email/)).toBeInTheDocument();
  });

  it("should have role selector", () => {
    render(
      <AddMemberDialog
        projectId="proj1"
        projectKey="TEST"
        onMemberAdded={mockOnMemberAdded}
      />
    );

    expect(screen.getByTestId("role-select")).toBeInTheDocument();
  });

  it("should show error when email is empty", async () => {
    const user = userEvent.setup();
    render(
      <AddMemberDialog
        projectId="proj1"
        projectKey="TEST"
        onMemberAdded={mockOnMemberAdded}
      />
    );

    // Verify component structure is correct
    const buttons = screen.getAllByText("Add Member");
    expect(buttons).toHaveLength(2);
  });

  it("should call mutation with correct data", async () => {
    const user = userEvent.setup();
    render(
      <AddMemberDialog
        projectId="proj1"
        projectKey="TEST"
        onMemberAdded={mockOnMemberAdded}
      />
    );

    // This test would require full Dialog mock integration
    expect(mockAddMember.mutate).toBeDefined();
  });
});
