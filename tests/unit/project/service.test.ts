// Unit tests for Project Service
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateProjectKey,
  validateProjectName,
  ProjectValidationError,
  ProjectAccessError,
  ProjectNotFoundError,
} from "~/modules/project/service";

describe("Project Service - Validation", () => {
  describe("validateProjectKey", () => {
    it("should accept valid uppercase keys", () => {
      expect(() => validateProjectKey("PLM")).not.toThrow();
      expect(() => validateProjectKey("PROJ01")).not.toThrow();
      expect(() => validateProjectKey("AB")).not.toThrow();
      expect(() => validateProjectKey("ABCDEFGHIJ")).not.toThrow(); // 10 chars (max)
    });

    it("should accept valid alphanumeric keys", () => {
      expect(() => validateProjectKey("PLM1")).not.toThrow();
      expect(() => validateProjectKey("P12345")).not.toThrow();
      expect(() => validateProjectKey("A1B2C3")).not.toThrow();
    });

    it("should reject empty keys", () => {
      expect(() => validateProjectKey("")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("   ")).toThrow(ProjectValidationError);
    });

    it("should reject keys with lowercase letters", () => {
      expect(() => validateProjectKey("plm")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("Plm")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PROJ01a")).toThrow(ProjectValidationError);
    });

    it("should reject keys with special characters", () => {
      expect(() => validateProjectKey("PLM-01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM_01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM.01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM 01")).toThrow(ProjectValidationError);
    });

    it("should reject keys shorter than 2 characters", () => {
      expect(() => validateProjectKey("A")).toThrow(ProjectValidationError);
    });

    it("should reject keys longer than 10 characters", () => {
      expect(() => validateProjectKey("ABCDEFGHIJK")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("01234567890")).toThrow(ProjectValidationError);
    });

    it("should provide meaningful error messages", () => {
      try {
        validateProjectKey("invalid");
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectValidationError);
        if (error instanceof ProjectValidationError) {
          expect(error.message).toContain("key");
          expect(error.message).toContain("2-10 uppercase letters and numbers");
        }
      }
    });
  });

  describe("validateProjectName", () => {
    it("should accept valid names", () => {
      expect(() => validateProjectName("My Project")).not.toThrow();
      expect(() => validateProjectName("PLM System")).not.toThrow();
      expect(() => validateProjectName("AB")).not.toThrow();
      expect(() => validateProjectName("A".repeat(255))).not.toThrow();
    });

    it("should reject empty names", () => {
      expect(() => validateProjectName("")).toThrow(ProjectValidationError);
      expect(() => validateProjectName("   ")).toThrow(ProjectValidationError);
    });

    it("should reject names shorter than 2 characters", () => {
      expect(() => validateProjectName("A")).toThrow(ProjectValidationError);
    });

    it("should reject names longer than 255 characters", () => {
      const longName = "A".repeat(256);
      expect(() => validateProjectName(longName)).toThrow(ProjectValidationError);
    });

    it("should provide meaningful error messages", () => {
      try {
        validateProjectName("");
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectValidationError);
        if (error instanceof ProjectValidationError) {
          expect(error.message).toContain("name");
          expect(error.message).toContain("required");
        }
      }
    });

    it("should reject names with only whitespace", () => {
      expect(() => validateProjectName("   ")).toThrow(ProjectValidationError);
      expect(() => validateProjectName("\t\n")).toThrow(ProjectValidationError);
    });
  });
});

describe("Project Service - Error Classes", () => {
  describe("ProjectValidationError", () => {
    it("should create error with field and message", () => {
      const error = new ProjectValidationError("key", "Invalid key format");
      expect(error.name).toBe("ProjectValidationError");
      expect(error.message).toBe("key: Invalid key format");
    });

    it("should be instanceof Error", () => {
      const error = new ProjectValidationError("name", "Invalid name");
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("ProjectAccessError", () => {
    it("should create error with message", () => {
      const error = new ProjectAccessError("Access denied");
      expect(error.name).toBe("ProjectAccessError");
      expect(error.message).toBe("Access denied");
    });

    it("should be instanceof Error", () => {
      const error = new ProjectAccessError("Denied");
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
