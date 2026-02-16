/**
 * Tests for ProtectedRoute component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Mock the auth store
const mockAuthStore = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockPush.mockClear();
    // Reset defaults
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.isLoading = false;
    mockAuthStore.user = null;
  });

  it("should show loading spinner when isLoading is true", () => {
    mockAuthStore.isLoading = true;
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("로그인 확인 중...")).toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", async () => {
    mockAuthStore.isLoading = false;
    mockAuthStore.isAuthenticated = false;
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should render children when authenticated", () => {
    mockAuthStore.isLoading = false;
    mockAuthStore.isAuthenticated = true;
    mockAuthStore.user = { id: "1", email: "test@example.com", roles: ["member"] };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to unauthorized when user lacks required role", async () => {
    mockAuthStore.isLoading = false;
    mockAuthStore.isAuthenticated = true;
    mockAuthStore.user = { id: "1", email: "test@example.com", roles: ["viewer"] };

    render(
      <ProtectedRoute requiredRoles={["admin", "owner"]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/unauthorized");
    });
  });

  it("should render children when user has required role", () => {
    mockAuthStore.isLoading = false;
    mockAuthStore.isAuthenticated = true;
    mockAuthStore.user = { id: "1", email: "test@example.com", roles: ["admin", "member"] };

    render(
      <ProtectedRoute requiredRoles={["admin"]}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
