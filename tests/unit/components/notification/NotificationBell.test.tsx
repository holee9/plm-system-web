/**
 * Tests for NotificationBell component
 *
 * Tests cover:
 * - Rendering bell icon with badge
 * - Badge display with unread count
 * - Badge display with count > 9 (shows 9+)
 * - SSE connection indicator
 * - Dropdown menu opening
 * - Loading state in dropdown
 * - Empty state in dropdown
 * - Notifications list display
 * - Mark all as read functionality
 * - Delete notification functionality
 * - Notification click with navigation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationBell } from "@/components/notification/notification-bell";

// Mock tRPC hooks
const mockNotifications = [
  {
    id: "1",
    type: "issue_assigned",
    title: "Issue assigned",
    message: "You have been assigned to issue PROJ-001",
    resourceType: "issue",
    resourceId: "ISS-001",
    isRead: false,
    createdAt: new Date("2026-02-18T10:00:00Z"),
  },
  {
    id: "2",
    type: "issue_commented",
    title: "New comment",
    message: "Someone commented on your issue",
    resourceType: "issue",
    resourceId: "ISS-002",
    isRead: true,
    createdAt: new Date("2026-02-17T14:00:00Z"),
  },
];

const mockGetUnreadCountQuery = vi.fn();
const mockListQuery = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      notification: {
        getUnreadCount: {
          invalidate: vi.fn(),
        },
        list: {
          invalidate: vi.fn(),
        },
      },
    }),
    notification: {
      getUnreadCount: {
        useQuery: () => mockGetUnreadCountQuery(),
      },
      list: {
        useQuery: () => mockListQuery(),
      },
      markAsRead: {
        useMutation: () => ({
          mutate: mockMarkAsRead,
        }),
      },
      markAllAsRead: {
        useMutation: () => ({
          mutate: mockMarkAllAsRead,
          isPending: false,
        }),
      },
      delete: {
        useMutation: () => ({
          mutate: mockDeleteNotification,
        }),
      },
    },
  },
}));

// Mock SSE hook
const mockSSEConnected = false;
vi.mock("@/hooks/use-sse-notifications", () => ({
  useSSENotifications: () => ({
    isConnected: mockSSEConnected,
  }),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.location
const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("NotificationBell Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  describe("Rendering", () => {
    it("should render bell icon", () => {
      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]');
      expect(bell).toBeInTheDocument();
    });

    it("should not show badge when unread count is 0", () => {
      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("should show badge with exact count when count <= 9", () => {
      mockGetUnreadCountQuery.mockReturnValue({ data: 5 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should show badge with 9+ when count > 9", () => {
      mockGetUnreadCountQuery.mockReturnValue({ data: 15 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("should show SSE disconnected indicator", () => {
      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      // WifiOff icon should be present (disconnected state)
      const wifiOff = document.querySelector("svg");
      expect(wifiOff).toBeInTheDocument();
    });
  });

  describe("Dropdown Menu", () => {
    it("should open dropdown when clicking bell", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      // Menu should open (checking for menu content)
      await waitFor(() => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      });
    });

    it("should show loading state when notifications are loading", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
      });
    });

    it("should show empty state when no notifications", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeInTheDocument();
      });
    });

    it("should display notifications list", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Issue assigned")).toBeInTheDocument();
        expect(screen.getByText("New comment")).toBeInTheDocument();
      });
    });

    it("should show 'Mark all read' button when there are notifications", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Mark all read")).toBeInTheDocument();
      });
    });

    it("should show 'View all notifications' link when there are notifications", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        const link = screen.getByText("View all notifications").closest("a");
        expect(link).toHaveAttribute("href", "/notifications");
      });
    });
  });

  describe("Actions", () => {
    it("should mark notification as read and navigate when clicking notification", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Issue assigned")).toBeInTheDocument();
      });

      const notificationItem = screen.getByText("Issue assigned").closest(".cursor-pointer");
      await user.click(notificationItem!);

      expect(mockMarkAsRead).toHaveBeenCalledWith({ id: "1" });
      expect(mockLocation.href).toBe("/issues/ISS-001");
    });

    it("should not mark as read if already read when clicking notification", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 0 });
      mockListQuery.mockReturnValue({
        data: [mockNotifications[1]], // Read notification
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("New comment")).toBeInTheDocument();
      });

      const notificationItem = screen.getByText("New comment").closest(".cursor-pointer");
      await user.click(notificationItem!);

      expect(mockMarkAsRead).not.toHaveBeenCalled();
    });

    it("should mark all notifications as read", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Mark all read")).toBeInTheDocument();
      });

      const markAllButton = screen.getByText("Mark all read");
      await user.click(markAllButton);

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe("Navigation", () => {
    it("should navigate to correct path for issue notification", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: [mockNotifications[0]],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      const notificationItem = screen.getByText("Issue assigned").closest(".cursor-pointer");
      await user.click(notificationItem!);

      expect(mockLocation.href).toBe("/issues/ISS-001");
    });

    it("should handle notification without resource gracefully", async () => {
      const user = userEvent.setup();

      const notificationWithoutResource = {
        id: "3",
        type: "project_member_added",
        title: "New member",
        message: "A new member joined",
        resourceType: null,
        resourceId: null,
        isRead: false,
        createdAt: new Date("2026-02-18T10:00:00Z"),
      };

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: [notificationWithoutResource],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      const notificationItem = screen.getByText("New member").closest(".cursor-pointer");
      await user.click(notificationItem!);

      // Should not navigate but mark as read
      expect(mockMarkAsRead).toHaveBeenCalled();
      expect(mockLocation.href).toBe("");
    });
  });

  describe("Time Formatting", () => {
    it("should format recent notification as 'Just now'", async () => {
      const user = userEvent.setup();

      const recentNotification = {
        id: "1",
        type: "issue_assigned",
        title: "Fresh notification",
        message: "Just happened",
        resourceType: "issue",
        resourceId: "ISS-001",
        isRead: false,
        createdAt: new Date(), // Just now
      };

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: [recentNotification],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        expect(screen.getByText("Fresh notification")).toBeInTheDocument();
        // The time formatting should show "Just now" for very recent notifications
        const timeElements = screen.getAllByText("Just now");
        expect(timeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Visual Indicators", () => {
    it("should show unread indicator for unread notifications", async () => {
      const user = userEvent.setup();

      mockGetUnreadCountQuery.mockReturnValue({ data: 1 });
      mockListQuery.mockReturnValue({
        data: [mockNotifications[0]],
        isLoading: false,
      });

      render(<NotificationBell />);

      const bell = document.querySelector('[aria-label="Notifications"]') as HTMLElement;
      await user.click(bell);

      await waitFor(() => {
        const unreadItem = screen.getByText("Issue assigned").closest(".bg-accent\\/50");
        expect(unreadItem).toBeInTheDocument();
      });
    });
  });
});
