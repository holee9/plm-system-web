// Unit tests for Project Service - Validation Functions
import { describe, it, expect } from "vitest";
import {
  validateProjectKey,
  validateProjectName,
  ProjectValidationError,
} from "../service";

describe("Project Service - Validation Functions", () => {
  describe("validateProjectKey", () => {
    it("should accept valid project keys", () => {
      expect(() => validateProjectKey("PLM")).not.toThrow();
      expect(() => validateProjectKey("PROJ01")).not.toThrow();
      expect(() => validateProjectKey("A1")).not.toThrow();
      expect(() => validateProjectKey("ABCD1234")).not.toThrow();
      expect(() => validateProjectKey("Z9")).not.toThrow();
    });

    it("should reject empty keys", () => {
      expect(() => validateProjectKey("")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("   ")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey(undefined as any)).toThrow(ProjectValidationError);
    });

    it("should reject keys with lowercase letters", () => {
      expect(() => validateProjectKey("plm")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("Proj01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("p1")).toThrow(ProjectValidationError);
    });

    it("should reject keys with special characters", () => {
      expect(() => validateProjectKey("PLM-01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM_01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM 01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM.01")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("PLM@01")).toThrow(ProjectValidationError);
    });

    it("should reject keys that are too short (< 2 characters)", () => {
      expect(() => validateProjectKey("P")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("1")).toThrow(ProjectValidationError);
    });

    it("should reject keys that are too long (> 10 characters)", () => {
      expect(() => validateProjectKey("ABCDEFGHIJK")).toThrow(ProjectValidationError);
      expect(() => validateProjectKey("12345678901")).toThrow(ProjectValidationError);
    });

    it("should provide helpful error messages", () => {
      try {
        validateProjectKey("invalid");
        expect.fail("Should have thrown ProjectValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectValidationError);
        if (error instanceof ProjectValidationError) {
          expect(error.message).toContain("key");
          expect(error.message).toContain("uppercase");
        }
      }
    });
  });

  describe("validateProjectName", () => {
    it("should accept valid project names", () => {
      expect(() => validateProjectName("My Project")).not.toThrow();
      expect(() => validateProjectName("AB")).not.toThrow();
      expect(() => validateProjectName("프로젝트")).not.toThrow();
      expect(() => validateProjectName("Project 123")).not.toThrow();
      expect(() => validateProjectName("A".repeat(255))).not.toThrow();
    });

    it("should reject empty names", () => {
      expect(() => validateProjectName("")).toThrow(ProjectValidationError);
      expect(() => validateProjectName("   ")).toThrow(ProjectValidationError);
      expect(() => validateProjectName(undefined as any)).toThrow(ProjectValidationError);
    });

    it("should reject names that are too short (< 2 characters)", () => {
      expect(() => validateProjectName("A")).toThrow(ProjectValidationError);
      expect(() => validateProjectName("가")).toThrow(ProjectValidationError);
    });

    it("should reject names that are too long (> 255 characters)", () => {
      expect(() => validateProjectName("A".repeat(256))).toThrow(ProjectValidationError);
      expect(() => validateProjectName("가".repeat(256))).toThrow(ProjectValidationError);
    });

    it("should provide helpful error messages", () => {
      try {
        validateProjectName("A");
        expect.fail("Should have thrown ProjectValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(ProjectValidationError);
        if (error instanceof ProjectValidationError) {
          expect(error.message).toContain("name");
        }
      }
    });
  });

  describe("ProjectValidationError Class", () => {
    it("should have correct name property", () => {
      const error = new ProjectValidationError("test", "test message");
      expect(error.name).toBe("ProjectValidationError");
    });

    it("should format error message correctly", () => {
      const error = new ProjectValidationError("key", "is required");
      expect(error.message).toBe("key: is required");
    });
  });
});
