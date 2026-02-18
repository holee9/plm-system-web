// Unit tests for Milestone Service
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateMilestoneTitle,
  MilestoneValidationError,
  MilestoneAccessError,
  MilestoneNotFoundError,
  ProjectNotFoundError,
} from "~/modules/project/milestone-service";

describe("Milestone Service - Validation", () => {
  describe("validateMilestoneTitle", () => {
    it("should accept valid titles", () => {
      expect(() => validateMilestoneTitle("Milestone 1")).not.toThrow();
      expect(() => validateMilestoneTitle("Sprint 1")).not.toThrow();
      expect(() => validateMilestoneTitle("AB")).not.toThrow();
      expect(() => validateMilestoneTitle("A".repeat(255))).not.toThrow();
    });

    it("should reject empty titles", () => {
      expect(() => validateMilestoneTitle("")).toThrow(MilestoneValidationError);
      expect(() => validateMilestoneTitle("   ")).toThrow(MilestoneValidationError);
    });

    it("should reject titles shorter than 2 characters", () => {
      expect(() => validateMilestoneTitle("A")).toThrow(MilestoneValidationError);
    });

    it("should reject titles longer than 255 characters", () => {
      const longTitle = "A".repeat(256);
      expect(() => validateMilestoneTitle(longTitle)).toThrow(MilestoneValidationError);
    });

    it("should provide meaningful error messages", () => {
      try {
        validateMilestoneTitle("");
      } catch (error) {
        expect(error).toBeInstanceOf(MilestoneValidationError);
        if (error instanceof MilestoneValidationError) {
          expect(error.message).toContain("title");
          expect(error.message).toContain("required");
        }
      }
    });

    it("should reject titles with only whitespace", () => {
      expect(() => validateMilestoneTitle("   ")).toThrow(MilestoneValidationError);
      expect(() => validateMilestoneTitle("\t\n")).toThrow(MilestoneValidationError);
    });
  });
});

describe("Milestone Service - Error Classes", () => {
  describe("MilestoneValidationError", () => {
    it("should create error with field and message", () => {
      const error = new MilestoneValidationError("title", "Invalid title");
      expect(error.name).toBe("MilestoneValidationError");
      expect(error.message).toBe("title: Invalid title");
    });

    it("should be instanceof Error", () => {
      const error = new MilestoneValidationError("title", "Invalid");
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("MilestoneAccessError", () => {
    it("should create error with message", () => {
      const error = new MilestoneAccessError("Access denied");
      expect(error.name).toBe("MilestoneAccessError");
      expect(error.message).toBe("Access denied");
    });

    it("should be instanceof Error", () => {
      const error = new MilestoneAccessError("Denied");
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("MilestoneNotFoundError", () => {
    it("should create error with milestone ID", () => {
      const error = new MilestoneNotFoundError("milestone-123");
      expect(error.name).toBe("MilestoneNotFoundError");
      expect(error.message).toBe("Milestone with ID milestone-123 not found");
    });

    it("should be instanceof Error", () => {
      const error = new MilestoneNotFoundError("milestone-123");
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("ProjectNotFoundError", () => {
    it("should create error with project ID", () => {
      const error = new ProjectNotFoundError("proj-123");
      expect(error.name).toBe("ProjectNotFoundError");
      expect(error.message).toBe("Project with ID proj-123 not found");
    });

    it("should be instanceof Error", () => {
      const error = new ProjectNotFoundError("proj-123");
      expect(error instanceof Error).toBe(true);
    });
  });
});
