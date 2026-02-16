/**
 * Unit tests for revision code generator
 * Tests revision code progression: A -> B -> ... -> Z -> AA -> AB -> ...
 */
import { describe, it, expect } from "vitest";
import { getNextRevisionCode, getPreviousRevisionCode, validateRevisionCode } from "../../../src/modules/plm/revision-utils";

describe("revision-utils", () => {
  describe("getNextRevisionCode", () => {
    it("should return 'A' for first revision", () => {
      expect(getNextRevisionCode(null)).toBe("A");
    });

    it("should return 'B' after 'A'", () => {
      expect(getNextRevisionCode("A")).toBe("B");
    });

    it("should return 'Z' after 'Y'", () => {
      expect(getNextRevisionCode("Y")).toBe("Z");
    });

    it("should return 'AA' after 'Z'", () => {
      expect(getNextRevisionCode("Z")).toBe("AA");
    });

    it("should return 'AB' after 'AA'", () => {
      expect(getNextRevisionCode("AA")).toBe("AB");
    });

    it("should return 'BA' after 'AZ'", () => {
      expect(getNextRevisionCode("AZ")).toBe("BA");
    });

    it("should return 'AAA' after 'ZZ'", () => {
      expect(getNextRevisionCode("ZZ")).toBe("AAA");
    });

    it("should handle multiple transitions", () => {
      // Test sequential progression: A -> B -> C -> D
      let current = null;
      current = getNextRevisionCode(current);
      expect(current).toBe("A");

      current = getNextRevisionCode(current);
      expect(current).toBe("B");

      current = getNextRevisionCode(current);
      expect(current).toBe("C");

      current = getNextRevisionCode(current);
      expect(current).toBe("D");
    });
  });

  describe("getPreviousRevisionCode", () => {
    it("should return null for 'A' (first revision)", () => {
      expect(getPreviousRevisionCode("A")).toBe(null);
    });

    it("should return 'A' for 'B'", () => {
      expect(getPreviousRevisionCode("B")).toBe("A");
    });

    it("should return 'Y' for 'Z'", () => {
      expect(getPreviousRevisionCode("Z")).toBe("Y");
    });

    it("should return 'Z' for 'AA'", () => {
      expect(getPreviousRevisionCode("AA")).toBe("Z");
    });

    it("should return 'AA' for 'AB'", () => {
      expect(getPreviousRevisionCode("AB")).toBe("AA");
    });

    it("should return 'AZ' for 'BA'", () => {
      expect(getPreviousRevisionCode("BA")).toBe("AZ");
    });

    it("should return 'ZZ' for 'AAA'", () => {
      expect(getPreviousRevisionCode("AAA")).toBe("ZZ");
    });
  });

  describe("validateRevisionCode", () => {
    it("should accept valid single-letter codes", () => {
      expect(validateRevisionCode("A")).toBe(true);
      expect(validateRevisionCode("Z")).toBe(true);
    });

    it("should accept valid multi-letter codes", () => {
      expect(validateRevisionCode("AA")).toBe(true);
      expect(validateRevisionCode("AB")).toBe(true);
      expect(validateRevisionCode("ZZ")).toBe(true);
      expect(validateRevisionCode("AAA")).toBe(true);
    });

    it("should reject lowercase letters", () => {
      expect(validateRevisionCode("a")).toBe(false);
      expect(validateRevisionCode("Aa")).toBe(false);
    });

    it("should reject non-letter characters", () => {
      expect(validateRevisionCode("1")).toBe(false);
      expect(validateRevisionCode("A1")).toBe(false);
      expect(validateRevisionCode("")).toBe(false);
      expect(validateRevisionCode("-")).toBe(false);
    });

    it("should reject null and undefined", () => {
      expect(validateRevisionCode(null as any)).toBe(false);
      expect(validateRevisionCode(undefined as any)).toBe(false);
    });
  });
});
