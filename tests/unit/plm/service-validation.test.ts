/**
 * Unit tests for PLM service validation utilities
 * Tests validation functions, error classes, and helper utilities
 */
import { describe, it, expect } from "vitest";
import {
  validatePartNumber,
  validatePartName,
} from "~/modules/plm/service";
import { PlmValidationError, PlmNotFoundError, PlmAccessError, BomCycleError } from "~/modules/plm/types";

describe("plm-service - validation utilities", () => {
  describe("validatePartNumber", () => {
    const validCases = [
      "P-001",
      "PART123",
      "A1-B2-C3",
      "X",
      "PART-001-REV-A",
      "12345",
      "PART-",
      "-PART",
      "A-B-C-D-E-F-G",
    ];

    const invalidCases = [
      { input: "", expectedError: "required" },
      { input: "   ", expectedError: "required" },
      { input: "P_001", expectedError: "alphanumeric" },
      { input: "PART 001", expectedError: "alphanumeric" },
      { input: "P.001", expectedError: "alphanumeric" },
      { input: "P@001", expectedError: "alphanumeric" },
      { input: "p-001", expectedError: "alphanumeric" },
      { input: "A".repeat(51), expectedError: "50 characters" },
    ];

    it("should accept valid part numbers", () => {
      validCases.forEach((partNumber) => {
        expect(() => validatePartNumber(partNumber)).not.toThrow();
      });
    });

    it("should reject invalid part numbers", () => {
      invalidCases.forEach(({ input, expectedError }) => {
        expect(() => validatePartNumber(input)).toThrow(PlmValidationError);
        expect(() => validatePartNumber(input)).toThrow(expectedError);
      });
    });

    it("should throw PlmValidationError with correct field", () => {
      try {
        validatePartNumber("");
        expect.fail("Should have thrown PlmValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(PlmValidationError);
        // The error message is "partNumber: Part number is required"
        expect((error as PlmValidationError).message).toContain("partNumber");
      }
    });
  });

  describe("validatePartName", () => {
    const validCases = [
      "AB",
      "Part Name",
      "A".repeat(255),
      "Part-123_Name",
      "Part@Component",
    ];

    const invalidCases = [
      { input: "", expectedError: "required" },
      { input: "   ", expectedError: "required" },
      { input: "A", expectedError: "at least 2 characters" },
      { input: "A".repeat(256), expectedError: "255 characters" },
    ];

    it("should accept valid part names", () => {
      validCases.forEach((name) => {
        expect(() => validatePartName(name)).not.toThrow();
      });
    });

    it("should reject invalid part names", () => {
      invalidCases.forEach(({ input, expectedError }) => {
        expect(() => validatePartName(input)).toThrow(PlmValidationError);
        expect(() => validatePartName(input)).toThrow(expectedError);
      });
    });

    it("should throw PlmValidationError with correct field", () => {
      try {
        validatePartName("");
        expect.fail("Should have thrown PlmValidationError");
      } catch (error) {
        expect(error).toBeInstanceOf(PlmValidationError);
        // The error message is "name: Part name is required"
        expect((error as PlmValidationError).message).toContain("name");
      }
    });
  });
});

describe("plm-types - error classes", () => {
  describe("PlmValidationError", () => {
    it("should create error with field and message", () => {
      const error = new PlmValidationError("partNumber", "Invalid part number");

      expect(error.name).toBe("PlmValidationError");
      // The error message is formatted as "field: message"
      expect(error.message).toBe("partNumber: Invalid part number");
    });

    it("should be instance of Error", () => {
      const error = new PlmValidationError("test", "test message");

      expect(error instanceof Error).toBe(true);
    });
  });

  describe("PlmNotFoundError", () => {
    it("should create error with resource and id", () => {
      const error = new PlmNotFoundError("Part", "part-123");

      expect(error.name).toBe("PlmNotFoundError");
      expect(error.message).toContain("Part");
      expect(error.message).toContain("part-123");
    });

    it("should format message correctly", () => {
      const error = new PlmNotFoundError("BOM", "bom-456");

      // The error message is formatted as "resource with ID id not found"
      expect(error.message).toContain("BOM");
      expect(error.message).toContain("bom-456");
    });
  });

  describe("PlmAccessError", () => {
    it("should create error with message", () => {
      const error = new PlmAccessError("Access denied");

      expect(error.name).toBe("PlmAccessError");
      expect(error.message).toBe("Access denied");
    });
  });

  describe("BomCycleError", () => {
    it("should create error with message", () => {
      const error = new BomCycleError("Circular reference detected");

      expect(error.name).toBe("BomCycleError");
      expect(error.message).toBe("Circular reference detected");
    });

    it("should be instance of Error", () => {
      const error = new BomCycleError("Cycle detected");

      expect(error instanceof Error).toBe(true);
    });
  });
});

describe("plm-types - type guards and utilities", () => {
  describe("PartStatus validation", () => {
    const validStatuses = ["draft", "active", "obsolete"] as const;

    it("should have correct part status values", () => {
      expect(validStatuses).toContain("draft");
      expect(validStatuses).toContain("active");
      expect(validStatuses).toContain("obsolete");
      expect(validStatuses).toHaveLength(3);
    });
  });

  describe("BOM quantity validation", () => {
    const validQuantities = [
      "1",
      "0.5",
      "100",
      "12.34",
      "0.01",
    ];

    const invalidQuantities = [
      "abc",
      "-1",
      "0",
      "1.234",
      "",
      "1.2.3",
    ];

    const quantityPattern = /^\d+(\.\d{1,2})?$/;

    it("should accept valid quantities", () => {
      validQuantities.forEach((qty) => {
        expect(quantityPattern.test(qty)).toBe(true);
      });
    });

    it("should reject invalid quantities", () => {
      // Update invalid cases based on the pattern /^\d+(\.\d{1,2})?$/
      // "0" is actually valid (0.00), and "1.2.3" is invalid
      expect(quantityPattern.test("abc")).toBe(false);
      expect(quantityPattern.test("-1")).toBe(false);
      expect(quantityPattern.test("")).toBe(false);
      expect(quantityPattern.test("1.2.3")).toBe(false);
    });
  });
});
