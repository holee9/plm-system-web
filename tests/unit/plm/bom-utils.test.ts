/**
 * Unit tests for BOM utilities
 * Tests cycle detection, tree building, and where-used queries
 */
import { describe, it, expect } from "vitest";
import {
  detectCycle,
  buildBomTree,
  flattenBomTree,
  calculateTotalQuantity,
  type BomTreeNode,
  type BomEdge,
} from "../../../src/modules/plm/bom-utils";

describe("bom-utils - cycle detection", () => {
  it("should detect no cycle in simple linear chain", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
      { parentId: "B", childId: "C", quantity: 1 },
    ];

    expect(detectCycle(edges, "A", "D")).toBe(false);
  });

  it("should detect direct self-reference", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
    ];

    expect(detectCycle(edges, "A", "A")).toBe(true);
  });

  it("should detect simple cycle A -> B -> A", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
      { parentId: "B", childId: "C", quantity: 1 },
      { parentId: "C", childId: "A", quantity: 1 },
    ];

    // Adding C -> A creates cycle when trying to add from A
    expect(detectCycle(edges, "A", "C")).toBe(true);
  });

  it("should detect indirect cycle A -> B -> C -> B", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
      { parentId: "B", childId: "C", quantity: 1 },
      { parentId: "C", childId: "D", quantity: 1 },
    ];

    // Adding D -> B creates cycle
    expect(detectCycle(edges, "B", "D")).toBe(true);
  });

  it("should allow adding child that doesn't create cycle", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
      { parentId: "B", childId: "C", quantity: 1 },
    ];

    // Adding D as child of A is safe
    expect(detectCycle(edges, "A", "D")).toBe(false);
  });

  it("should handle empty edge list", () => {
    expect(detectCycle([], "A", "B")).toBe(false);
  });

  it("should detect cycle in complex diamond structure", () => {
    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1 },
      { parentId: "A", childId: "C", quantity: 1 },
      { parentId: "B", childId: "D", quantity: 1 },
      { parentId: "C", childId: "D", quantity: 1 },
    ];

    // Adding D -> A creates cycle
    expect(detectCycle(edges, "A", "D")).toBe(true);
  });
});

describe("bom-utils - tree building", () => {
  it("should build simple two-level tree", () => {
    const parts = new Map([
      ["A", { id: "A", name: "Part A", partNumber: "P001" }],
      ["B", { id: "B", name: "Part B", partNumber: "P002" }],
      ["C", { id: "C", name: "Part C", partNumber: "P003" }],
    ]);

    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: "2", unit: "EA" },
      { parentId: "A", childId: "C", quantity: "1", unit: "EA" },
    ];

    const tree = buildBomTree("A", parts, edges);

    expect(tree.partId).toBe("A");
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].partId).toBe("B");
    expect(tree.children[0].quantity).toBe("2");
    expect(tree.children[1].partId).toBe("C");
    expect(tree.children[1].quantity).toBe("1");
  });

  it("should build deep hierarchical tree", () => {
    const parts = new Map([
      ["A", { id: "A", name: "Part A", partNumber: "P001" }],
      ["B", { id: "B", name: "Part B", partNumber: "P002" }],
      ["C", { id: "C", name: "Part C", partNumber: "P003" }],
      ["D", { id: "D", name: "Part D", partNumber: "P004" }],
    ]);

    const edges: BomEdge[] = [
      { parentId: "A", childId: "B", quantity: 1, unit: "EA" },
      { parentId: "B", childId: "C", quantity: 2, unit: "EA" },
      { parentId: "C", childId: "D", quantity: 1, unit: "EA" },
    ];

    const tree = buildBomTree("A", parts, edges);

    expect(tree.partId).toBe("A");
    expect(tree.children[0].partId).toBe("B");
    expect(tree.children[0].children[0].partId).toBe("C");
    expect(tree.children[0].children[0].children[0].partId).toBe("D");
  });

  it("should sort children by position", () => {
    const parts = new Map([
      ["A", { id: "A", name: "Part A", partNumber: "P001" }],
      ["B", { id: "B", name: "Part B", partNumber: "P002" }],
      ["C", { id: "C", name: "Part C", partNumber: "P003" }],
    ]);

    const edges: BomEdge[] = [
      { parentId: "A", childId: "C", quantity: 1, unit: "EA", position: 2 },
      { parentId: "A", childId: "B", quantity: 1, unit: "EA", position: 1 },
    ];

    const tree = buildBomTree("A", parts, edges);

    expect(tree.children[0].partId).toBe("B"); // position 1
    expect(tree.children[1].partId).toBe("C"); // position 2
  });
});

describe("bom-utils - flatten tree", () => {
  it("should flatten simple tree to flat list", () => {
    const tree: BomTreeNode = {
      partId: "A",
      partNumber: "P001",
      name: "Part A",
      quantity: "1",
      unit: "EA",
      level: 0,
      path: "A",
      children: [
        {
          partId: "B",
          partNumber: "P002",
          name: "Part B",
          quantity: "2",
          unit: "EA",
          level: 1,
          path: "A > B",
          children: [],
        },
      ],
    };

    const flat = flattenBomTree(tree);

    expect(flat).toHaveLength(2);
    expect(flat[0].partId).toBe("A");
    expect(flat[0].level).toBe(0);
    expect(flat[1].partId).toBe("B");
    expect(flat[1].level).toBe(1);
  });

  it("should handle empty tree", () => {
    const tree: BomTreeNode = {
      partId: "A",
      partNumber: "P001",
      name: "Part A",
      quantity: "1",
      unit: "EA",
      level: 0,
      path: "A",
      children: [],
    };

    const flat = flattenBomTree(tree);

    expect(flat).toHaveLength(1);
  });
});

describe("bom-utils - calculate total quantity", () => {
  it("should calculate quantity for linear chain", () => {
    const tree: BomTreeNode = {
      partId: "A",
      partNumber: "P001",
      name: "Part A",
      quantity: "1",
      unit: "EA",
      level: 0,
      path: "A",
      children: [
        {
          partId: "B",
          partNumber: "P002",
          name: "Part B",
          quantity: "2",
          unit: "EA",
          level: 1,
          path: "A > B",
          children: [
            {
              partId: "C",
              partNumber: "P003",
              name: "Part C",
              quantity: "3",
              unit: "EA",
              level: 2,
              path: "A > B > C",
              children: [],
            },
          ],
        },
      ],
    };

    // Total C needed = 1 * 2 * 3 = 6
    expect(calculateTotalQuantity(tree, "C")).toBe("6");
  });

  it("should calculate quantity for diamond structure", () => {
    const tree: BomTreeNode = {
      partId: "A",
      partNumber: "P001",
      name: "Part A",
      quantity: "1",
      unit: "EA",
      level: 0,
      path: "A",
      children: [
        {
          partId: "B",
          partNumber: "P002",
          name: "Part B",
          quantity: "2",
          unit: "EA",
          level: 1,
          path: "A > B",
          children: [
            {
              partId: "D",
              partNumber: "P004",
              name: "Part D",
              quantity: "1",
              unit: "EA",
              level: 2,
              path: "A > B > D",
              children: [],
            },
          ],
        },
        {
          partId: "C",
          partNumber: "P003",
          name: "Part C",
          quantity: "3",
          unit: "EA",
          level: 1,
          path: "A > C",
          children: [
            {
              partId: "D",
              partNumber: "P004",
              name: "Part D",
              quantity: "4",
              unit: "EA",
              level: 2,
              path: "A > C > D",
              children: [],
            },
          ],
        },
      ],
    };

    // Total D needed = (2 * 1) + (3 * 4) = 2 + 12 = 14
    expect(calculateTotalQuantity(tree, "D")).toBe("14");
  });

  it("should return 0 if part not found in tree", () => {
    const tree: BomTreeNode = {
      partId: "A",
      partNumber: "P001",
      name: "Part A",
      quantity: "1",
      unit: "EA",
      level: 0,
      path: "A",
      children: [],
    };

    expect(calculateTotalQuantity(tree, "X")).toBe("0");
  });
});
