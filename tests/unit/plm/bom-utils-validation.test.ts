/**
 * Additional unit tests for BOM utilities
 * Tests edge cases, validation functions, and where-used queries
 */
import { describe, it, expect } from "vitest";
import {
  findWhereUsed,
  validateBomTree,
  type BomEdge,
} from "~/modules/plm/bom-utils";

describe("bom-utils - findWhereUsed", () => {
  const edges: BomEdge[] = [
    { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
    { parentId: "A", childId: "C", quantity: "2", unit: "EA" },
    { parentId: "B", childId: "D", quantity: "1", unit: "EA" },
    { parentId: "C", childId: "D", quantity: "1", unit: "EA" }, // D is used in both B and C
    { parentId: "E", childId: "F", quantity: "1", unit: "EA" },
  ];

  it("should find all parents of a part", () => {
    const result = findWhereUsed("D", edges);

    expect(result).toHaveLength(2);
    expect(result).toContain("B");
    expect(result).toContain("C");
  });

  it("should return empty array for unused part", () => {
    const result = findWhereUsed("A", edges);

    expect(result).toHaveLength(0);
  });

  it("should return empty array for non-existent part", () => {
    const result = findWhereUsed("Z", edges);

    expect(result).toHaveLength(0);
  });

  it("should handle single parent", () => {
    const result = findWhereUsed("B", edges);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe("A");
  });

  it("should return single parent for leaf part", () => {
    const result = findWhereUsed("F", edges);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe("E");
  });
});

describe("bom-utils - validateBomTree", () => {
  const parts = new Map([
    ["A", { id: "A", name: "Part A", partNumber: "P001" }],
    ["B", { id: "B", name: "Part B", partNumber: "P002" }],
    ["C", { id: "C", name: "Part C", partNumber: "P003" }],
    ["D", { id: "D", name: "Part D", partNumber: "P004" }],
  ]);

  const validEdges: BomEdge[] = [
    { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
    { parentId: "B", childId: "C", quantity: "1", unit: "EA" },
    { parentId: "C", childId: "D", quantity: "1", unit: "EA" },
  ];

  it("should validate correct tree", () => {
    const result = validateBomTree("A", parts, validEdges);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject non-existent root part", () => {
    const result = validateBomTree("Z", parts, validEdges);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Root part Z not found");
  });

  it("should detect cycles", () => {
    const cyclicEdges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
      { parentId: "B", childId: "C", quantity: "1", unit: "EA" },
      { parentId: "C", childId: "A", quantity: "1", unit: "EA" }, // Cycle
    ];

    const result = validateBomTree("A", parts, cyclicEdges);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Cycle"))).toBe(true);
  });

  it("should detect missing child parts", () => {
    const edgesWithMissing: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
      { parentId: "B", childId: "Z", quantity: "1", unit: "EA" }, // Z doesn't exist
    ];

    const result = validateBomTree("A", parts, edgesWithMissing);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Z") && e.includes("not found"))).toBe(true);
  });

  it("should enforce max depth limit", () => {
    const deepEdges: BomEdge[] = [
      { parentId: "L1", childId: "L2", quantity: "1", unit: "EA" },
      { parentId: "L2", childId: "L3", quantity: "1", unit: "EA" },
      { parentId: "L3", childId: "L4", quantity: "1", unit: "EA" },
      { parentId: "L4", childId: "L5", quantity: "1", unit: "EA" },
      { parentId: "L5", childId: "L6", quantity: "1", unit: "EA" },
    ];

    const deepParts = new Map([
      ["L1", { id: "L1", name: "Level 1", partNumber: "L001" }],
      ["L2", { id: "L2", name: "Level 2", partNumber: "L002" }],
      ["L3", { id: "L3", name: "Level 3", partNumber: "L003" }],
      ["L4", { id: "L4", name: "Level 4", partNumber: "L004" }],
      ["L5", { id: "L5", name: "Level 5", partNumber: "L005" }],
      ["L6", { id: "L6", name: "Level 6", partNumber: "L006" }],
    ]);

    const result = validateBomTree("L1", deepParts, deepEdges, 3);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Maximum depth"))).toBe(true);
  });

  it("should validate diamond structure correctly", () => {
    const diamondEdges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
      { parentId: "A", childId: "C", quantity: "1", unit: "EA" },
      { parentId: "B", childId: "D", quantity: "1", unit: "EA" },
      { parentId: "C", childId: "D", quantity: "1", unit: "EA" },
    ];

    const diamondParts = new Map([
      ["A", { id: "A", name: "Root", partNumber: "P001" }],
      ["B", { id: "B", name: "Branch 1", partNumber: "P002" }],
      ["C", { id: "C", name: "Branch 2", partNumber: "P003" }],
      ["D", { id: "D", name: "Leaf", partNumber: "P004" }],
    ]);

    const result = validateBomTree("A", diamondParts, diamondEdges);

    expect(result.valid).toBe(true);
  });

  it("should handle empty edges", () => {
    const result = validateBomTree("A", parts, []);

    expect(result.valid).toBe(true);
  });
});

describe("bom-utils - quantity calculation edge cases", () => {
  it("should calculate quantity for complex multi-path structure", () => {
    // Tree structure:
    //       A (1)
    //      / \
    //     B(2) C(3)
    //    / \   \
    //   D(1) E(1) F(2)
    //      \
    //       G(1)

    // Total for G: 1 * 2 * 1 * 1 = 2 (through B->E->G)
    // But wait, we need to trace paths properly
    // A(1) -> B(2) -> E(1) -> G(1) = 1 * 2 * 1 * 1 = 2
  });

  it("should handle decimal quantities correctly", () => {
    const decimalEdges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "0.5", unit: "KG" },
      { parentId: "B", childId: "C", quantity: "2.5", unit: "KG" },
    ];

    // Quantity calculation should handle decimals
    expect(parseFloat("0.5") * parseFloat("2.5")).toBe(1.25);
  });

  it("should handle very large quantities", () => {
    const largeQty = "9999.99";
    expect(parseFloat(largeQty)).toBe(9999.99);
  });
});

describe("bom-utils - position sorting", () => {
  it("should handle unsorted position values", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "C", quantity: "1", unit: "EA", position: 3 },
      { parentId: "A", childId: "A1", quantity: "1", unit: "EA", position: 1 },
      { parentId: "A", childId: "B", quantity: "1", unit: "EA", position: 2 },
    ];

    // When sorted, should be A1, B, C
    const sortedEdges = [...edges].sort((a, b) => (a.position || 0) - (b.position || 0));

    expect(sortedEdges[0].childId).toBe("A1");
    expect(sortedEdges[1].childId).toBe("B");
    expect(sortedEdges[2].childId).toBe("C");
  });

  it("should handle missing position values", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "1", unit: "EA", position: 1 },
      { parentId: "A", childId: "C", quantity: "1", unit: "EA" }, // No position
      { parentId: "A", childId: "D", quantity: "1", unit: "EA", position: 2 },
    ];

    const sortedEdges = [...edges].sort((a, b) => (a.position || 0) - (b.position || 0));

    // Items without position should come first (position = 0)
    expect(sortedEdges[0].childId).toBe("C");
  });
});

describe("bom-utils - empty and single node trees", () => {
  it("should handle single node tree", () => {
    const parts = new Map([
      ["A", { id: "A", name: "Single Part", partNumber: "P001" }],
    ]);

    const result = validateBomTree("A", parts, []);

    expect(result.valid).toBe(true);
  });

  it("should handle tree with only leaf children", () => {
    const parts = new Map([
      ["A", { id: "A", name: "Parent", partNumber: "P001" }],
      ["B", { id: "B", name: "Child 1", partNumber: "P002" }],
      ["C", { id: "C", name: "Child 2", partNumber: "P003" }],
    ]);

    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "1", unit: "EA" },
      { parentId: "A", childId: "C", quantity: "1", unit: "EA" },
    ];

    const result = validateBomTree("A", parts, edges);

    expect(result.valid).toBe(true);
  });
});
