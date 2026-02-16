// Tests for issue status transition machine
import { describe, it, expect } from "vitest";
import {
  isValidStatusTransition,
  getNextStatuses,
  getStatusColor,
  getStatusLabel,
  isTerminalStatus,
  isWorkingStatus,
} from "../status-machine";
import type { IssueStatus } from "../types";

describe("Status Transition Machine", () => {
  describe("isValidStatusTransition", () => {
    it("should allow valid forward transitions from open", () => {
      expect(isValidStatusTransition("open", "in_progress")).toBe(true);
      expect(isValidStatusTransition("open", "closed")).toBe(true);
    });

    it("should reject invalid transitions from open", () => {
      expect(isValidStatusTransition("open", "review")).toBe(false);
      expect(isValidStatusTransition("open", "done")).toBe(false);
    });

    it("should allow all transitions from in_progress", () => {
      expect(isValidStatusTransition("in_progress", "review")).toBe(true);
      expect(isValidStatusTransition("in_progress", "open")).toBe(true);
      expect(isValidStatusTransition("in_progress", "closed")).toBe(true);
    });

    it("should allow all transitions from review", () => {
      expect(isValidStatusTransition("review", "done")).toBe(true);
      expect(isValidStatusTransition("review", "in_progress")).toBe(true);
      expect(isValidStatusTransition("review", "closed")).toBe(true);
    });

    it("should allow completion and reopen from done", () => {
      expect(isValidStatusTransition("done", "closed")).toBe(true);
      expect(isValidStatusTransition("done", "open")).toBe(true);
    });

    it("should only allow reopen from closed", () => {
      expect(isValidStatusTransition("closed", "open")).toBe(true);
      expect(isValidStatusTransition("closed", "in_progress")).toBe(false);
      expect(isValidStatusTransition("closed", "review")).toBe(false);
      expect(isValidStatusTransition("closed", "done")).toBe(false);
    });

    it("should allow same status (idempotent)", () => {
      const statuses: IssueStatus[] = ["open", "in_progress", "review", "done", "closed"];
      for (const status of statuses) {
        expect(isValidStatusTransition(status, status)).toBe(true);
      }
    });
  });

  describe("getNextStatuses", () => {
    it("should return correct next statuses for open", () => {
      expect(getNextStatuses("open")).toEqual(["in_progress", "closed"]);
    });

    it("should return correct next statuses for in_progress", () => {
      expect(getNextStatuses("in_progress")).toEqual(["review", "open", "closed"]);
    });

    it("should return correct next statuses for review", () => {
      expect(getNextStatuses("review")).toEqual(["done", "in_progress", "closed"]);
    });

    it("should return correct next statuses for done", () => {
      expect(getNextStatuses("done")).toEqual(["closed", "open"]);
    });

    it("should return correct next statuses for closed", () => {
      expect(getNextStatuses("closed")).toEqual(["open"]);
    });
  });

  describe("getStatusColor", () => {
    it("should return valid hex colors", () => {
      const statuses: IssueStatus[] = ["open", "in_progress", "review", "done", "closed"];
      for (const status of statuses) {
        const color = getStatusColor(status);
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it("should return distinct colors for different statuses", () => {
      const colors = new Set<IssueStatus>();
      const statuses: IssueStatus[] = ["open", "in_progress", "review", "done", "closed"];
      for (const status of statuses) {
        colors.add(getStatusColor(status) as IssueStatus);
      }
      expect(colors.size).toBe(5);
    });
  });

  describe("getStatusLabel", () => {
    it("should return Korean labels", () => {
      expect(getStatusLabel("open")).toBe("열림");
      expect(getStatusLabel("in_progress")).toBe("진행 중");
      expect(getStatusLabel("review")).toBe("검토 중");
      expect(getStatusLabel("done")).toBe("완료");
      expect(getStatusLabel("closed")).toBe("닫힘");
    });
  });

  describe("isTerminalStatus", () => {
    it("should return true only for closed status", () => {
      expect(isTerminalStatus("closed")).toBe(true);
      expect(isTerminalStatus("done")).toBe(false);
      expect(isTerminalStatus("open")).toBe(false);
    });
  });

  describe("isWorkingStatus", () => {
    it("should return true for in_progress and review", () => {
      expect(isWorkingStatus("in_progress")).toBe(true);
      expect(isWorkingStatus("review")).toBe(true);
      expect(isWorkingStatus("open")).toBe(false);
      expect(isWorkingStatus("done")).toBe(false);
      expect(isWorkingStatus("closed")).toBe(false);
    });
  });
});
