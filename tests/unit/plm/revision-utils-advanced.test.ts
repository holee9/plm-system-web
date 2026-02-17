/**
 * Advanced unit tests for revision code utilities
 * Tests edge cases, comparison, sorting, and validation
 */
import { describe, it, expect } from "vitest";
import {
  getNextRevisionCode,
  getPreviousRevisionCode,
  validateRevisionCode,
  compareRevisionCodes,
  sortRevisionCodes,
} from "~/modules/plm/revision-utils";

describe("revision-utils - comparison and sorting", () => {
  describe("compareRevisionCodes", () => {
    it("should return -1 when first < second", () => {
      expect(compareRevisionCodes("A", "B")).toBe(-1);
      expect(compareRevisionCodes("A", "AA")).toBe(-1);
      expect(compareRevisionCodes("Z", "AA")).toBe(-1);
    });

    it("should return 0 when codes are equal", () => {
      expect(compareRevisionCodes("A", "A")).toBe(0);
      expect(compareRevisionCodes("ABC", "ABC")).toBe(0);
    });

    it("should return 1 when first > second", () => {
      expect(compareRevisionCodes("B", "A")).toBe(1);
      expect(compareRevisionCodes("AA", "A")).toBe(1);
      expect(compareRevisionCodes("AA", "Z")).toBe(1);
    });

    it("should compare by length first (shorter is earlier)", () => {
      expect(compareRevisionCodes("Z", "AA")).toBe(-1); // Z (1 char) < AA (2 chars)
      expect(compareRevisionCodes("ZZ", "AAA")).toBe(-1); // ZZ (2 chars) < AAA (3 chars)
    });

    it("should compare lexicographically when same length", () => {
      expect(compareRevisionCodes("AA", "AB")).toBe(-1);
      expect(compareRevisionCodes("AB", "AC")).toBe(-1);
      expect(compareRevisionCodes("AZ", "BA")).toBe(-1);
    });
  });

  describe("sortRevisionCodes", () => {
    it("should sort empty array", () => {
      expect(sortRevisionCodes([])).toEqual([]);
    });

    it("should sort single element", () => {
      expect(sortRevisionCodes(["C"])).toEqual(["C"]);
    });

    it("should sort simple progression", () => {
      const input = ["C", "A", "B"];
      const expected = ["A", "B", "C"];

      expect(sortRevisionCodes(input)).toEqual(expected);
    });

    it("should sort mixed length codes", () => {
      const input = ["Z", "AA", "A", "AB", "B"];
      const expected = ["A", "B", "Z", "AA", "AB"];

      expect(sortRevisionCodes(input)).toEqual(expected);
    });

    it("should not mutate original array", () => {
      const input = ["C", "B", "A"];
      const originalInput = [...input];

      sortRevisionCodes(input);

      expect(input).toEqual(originalInput);
    });
  });
});

describe("revision-utils - getNextRevisionCode edge cases", () => {
  it("should handle single character rollover", () => {
    expect(getNextRevisionCode("Z")).toBe("AA");
  });

  it("should handle double character rollover", () => {
    expect(getNextRevisionCode("ZZ")).toBe("AAA");
  });

  it("should handle triple character rollover", () => {
    expect(getNextRevisionCode("ZZZ")).toBe("AAAA");
  });

  it("should handle mid-string increment", () => {
    expect(getNextRevisionCode("AZ")).toBe("BA");
    expect(getNextRevisionCode("BZ")).toBe("CA");
  });

  it("should handle complex multi-character increment", () => {
    expect(getNextRevisionCode("AY")).toBe("AZ");
    expect(getNextRevisionCode("BA")).toBe("BB");
    expect(getNextRevisionCode("ZZA")).toBe("ZZB");
  });
});

describe("revision-utils - getPreviousRevisionCode edge cases", () => {
  it("should return null for first revision", () => {
    expect(getPreviousRevisionCode("A")).toBe(null);
  });

  it("should handle single character decrement", () => {
    expect(getPreviousRevisionCode("B")).toBe("A");
    expect(getPreviousRevisionCode("Z")).toBe("Y");
  });

  it("should handle double character decrement", () => {
    expect(getPreviousRevisionCode("AA")).toBe("Z");
    expect(getPreviousRevisionCode("AB")).toBe("AA");
    expect(getPreviousRevisionCode("BA")).toBe("AZ");
  });

  it("should handle triple character decrement", () => {
    expect(getPreviousRevisionCode("AAA")).toBe("ZZ");
    expect(getPreviousRevisionCode("AAB")).toBe("AAA");
  });

  it("should handle mid-string decrement", () => {
    expect(getPreviousRevisionCode("BZ")).toBe("BY");
    expect(getPreviousRevisionCode("CA")).toBe("BZ");
  });
});

describe("revision-utils - validateRevisionCode edge cases", () => {
  it("should accept uppercase letters only", () => {
    expect(validateRevisionCode("A")).toBe(true);
    expect(validateRevisionCode("Z")).toBe(true);
    expect(validateRevisionCode("ABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe(true);
  });

  it("should reject lowercase letters", () => {
    expect(validateRevisionCode("a")).toBe(false);
    expect(validateRevisionCode("Aa")).toBe(false);
    expect(validateRevisionCode("abc")).toBe(false);
  });

  it("should reject mixed case", () => {
    expect(validateRevisionCode("AaB")).toBe(false);
    expect(validateRevisionCode("aBC")).toBe(false);
  });

  it("should reject numbers", () => {
    expect(validateRevisionCode("1")).toBe(false);
    expect(validateRevisionCode("A1")).toBe(false);
    expect(validateRevisionCode("123")).toBe(false);
  });

  it("should reject special characters", () => {
    expect(validateRevisionCode("A-")).toBe(false);
    expect(validateRevisionCode("A_")).toBe(false);
    expect(validateRevisionCode("A.")).toBe(false);
    expect(validateRevisionCode("A ")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validateRevisionCode("")).toBe(false);
  });

  it("should reject null", () => {
    expect(validateRevisionCode(null)).toBe(false);
  });

  it("should reject undefined", () => {
    expect(validateRevisionCode(undefined)).toBe(false);
  });
});

describe("revision-utils - round-trip consistency", () => {
  it("should maintain consistency through forward and back", () => {
    const testCases = ["A", "B", "Y", "Z", "AA", "AB", "AZ", "BA", "ZZ", "AAA"];

    for (const code of testCases) {
      const next = getNextRevisionCode(code);
      const back = getPreviousRevisionCode(next);

      expect(back).toBe(code);
    }
  });

  it("should handle sequential round-trips", () => {
    let current = null;

    // A -> B -> A
    current = getNextRevisionCode(current);
    expect(current).toBe("A");

    current = getNextRevisionCode(current);
    expect(current).toBe("B");

    const previous = getPreviousRevisionCode(current);
    expect(previous).toBe("A");
  });
});

describe("revision-utils - invalid input handling", () => {
  it("should throw error for invalid code in getNextRevisionCode", () => {
    expect(() => getNextRevisionCode("123")).toThrow("Invalid revision code");
    expect(() => getNextRevisionCode("a")).toThrow("Invalid revision code");
    expect(() => getNextRevisionCode("A-1")).toThrow("Invalid revision code");
  });

  it("should throw error for invalid code in getPreviousRevisionCode", () => {
    expect(() => getPreviousRevisionCode("123")).toThrow("Invalid revision code");
    expect(() => getPreviousRevisionCode("a")).toThrow("Invalid revision code");
  });
});

describe("revision-utils - large revision codes", () => {
  it("should handle very long revision codes", () => {
    const longCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    expect(validateRevisionCode(longCode)).toBe(true);

    const next = getNextRevisionCode(longCode);
    // When incrementing, 'Z' becomes 'A' with carry to the left
    // But only if the character to the left is also 'Z'
    // "ABCDEFGHIJKLMNOPQRSTUVWXYZ" has 'Y' before the last 'Z', so only 'Z' -> 'A'
    expect(next.length).toBe(longCode.length);
    // The actual result is "ABCDEFGHIJKLMNOPQRSTUVWXZA" (Y before Z, so Z becomes A)
    expect(next).toBe("ABCDEFGHIJKLMNOPQRSTUVWXZA");
  });

  it("should handle ZZZZ rollover", () => {
    const result = getNextRevisionCode("ZZZZ");
    expect(result).toBe("AAAAA");
  });
});

describe("revision-utils - practical usage scenarios", () => {
  it("should simulate revision progression for a part", () => {
    const revisions: string[] = [];
    let current = null;

    // Create 10 revisions
    for (let i = 0; i < 10; i++) {
      current = getNextRevisionCode(current);
      revisions.push(current);
    }

    expect(revisions).toEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);
  });

  it("should simulate revision progression beyond Z", () => {
    const revisions: string[] = [];
    let current = "Y";

    for (let i = 0; i < 5; i++) {
      current = getNextRevisionCode(current);
      revisions.push(current);
    }

    expect(revisions).toEqual(["Z", "AA", "AB", "AC", "AD"]);
  });

  it("should sort realistic revision history", () => {
    const history = ["C", "A", "B", "AB", "AA"];
    const sorted = sortRevisionCodes(history);

    expect(sorted).toEqual(["A", "B", "C", "AA", "AB"]);
  });

  it("should find latest revision from sorted list", () => {
    const revisions = ["A", "C", "B", "AA", "Z"];
    const sorted = sortRevisionCodes(revisions);
    const latest = sorted[sorted.length - 1];

    expect(latest).toBe("AA"); // AA comes after Z in sorting
  });
});
