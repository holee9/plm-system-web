// Issue Status Transition Machine

import type { IssueStatus } from "./types";

/**
 * Valid state transitions
 * From: [To states]
 */
const TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  open: ["in_progress", "closed"],
  in_progress: ["review", "open", "closed"],
  review: ["done", "in_progress", "closed"],
  done: ["closed", "open"],
  closed: ["open"],
};

/**
 * Validate status transition
 * @param currentStatus Current issue status
 * @param newStatus Desired status
 * @returns true if transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: IssueStatus,
  newStatus: IssueStatus
): boolean {
  // Same status is always allowed (idempotent)
  if (currentStatus === newStatus) {
    return true;
  }

  // Check if transition is defined
  const allowedStates = TRANSITIONS[currentStatus];
  return allowedStates.includes(newStatus);
}

/**
 * Get all allowed next states from current status
 * @param currentStatus Current issue status
 * @returns Array of allowed next statuses
 */
export function getNextStatuses(currentStatus: IssueStatus): IssueStatus[] {
  return [...TRANSITIONS[currentStatus]];
}

/**
 * Get status color for UI rendering
 * @param status Issue status
 * @returns Hex color code
 */
export function getStatusColor(status: IssueStatus): string {
  const colors: Record<IssueStatus, string> = {
    open: "#6b7280", // gray
    in_progress: "#3b82f6", // blue
    review: "#f59e0b", // amber
    done: "#10b981", // green
    closed: "#9ca3af", // gray
  };
  return colors[status];
}

/**
 * Get status display label (Korean)
 * @param status Issue status
 * @returns Korean label
 */
export function getStatusLabel(status: IssueStatus): string {
  const labels: Record<IssueStatus, string> = {
    open: "열림",
    in_progress: "진행 중",
    review: "검토 중",
    done: "완료",
    closed: "닫힘",
  };
  return labels[status];
}

/**
 * Check if status is a terminal state (no further transitions except reopen)
 * @param status Issue status
 * @returns true if status is terminal
 */
export function isTerminalStatus(status: IssueStatus): boolean {
  return status === "closed";
}

/**
 * Check if status is a working state (issue is actively being worked on)
 * @param status Issue status
 * @returns true if status is working state
 */
export function isWorkingStatus(status: IssueStatus): boolean {
  return status === "in_progress" || status === "review";
}
