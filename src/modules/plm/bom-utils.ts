/**
 * BOM (Bill of Materials) utilities
 * Handles cycle detection, tree building, flattening, and quantity calculation
 */

import type { BomTreeNode, FlatBomItem, PartStatus } from "./types";

// Re-export types for convenience
export type { BomTreeNode, FlatBomItem };

export interface BomEdge {
  parentId: string;
  childId: string;
  quantity: string;
  unit?: string;
  position?: number;
  notes?: string;
}

/**
 * Detect if adding a child part would create a cycle
 * Uses DFS to check if childPartId is an ancestor of parentPartId
 *
 * @param edges - Existing BOM relationships
 * @param parentPartId - Parent part ID
 * @param childPartId - Child part ID to add
 * @returns true if cycle would be created
 */
export function detectCycle(
  edges: BomEdge[],
  parentPartId: string,
  childPartId: string
): boolean {
  // Direct self-reference is always a cycle
  if (parentPartId === childPartId) {
    return true;
  }

  // Build adjacency list for efficient traversal
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.parentId)) {
      adj.set(edge.parentId, []);
    }
    adj.get(edge.parentId)!.push(edge.childId);
  }

  // DFS to check if childPartId is reachable from parentPartId
  const visited = new Set<string>();
  const stack = [parentPartId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === childPartId) {
      return true; // Cycle detected
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const children = adj.get(current) || [];
    for (const child of children) {
      if (!visited.has(child)) {
        stack.push(child);
      }
    }
  }

  return false; // No cycle
}

/**
 * Build hierarchical BOM tree from flat relationships
 *
 * @param rootPartId - Root part ID
 * @param parts - Map of part ID to part data
 * @param edges - BOM relationships
 * @param maxDepth - Maximum depth to traverse (default: 20)
 * @returns BOM tree root node
 */
export function buildBomTree(
  rootPartId: string,
  parts: Map<string, { id: string; name: string; partNumber: string; description?: string; category?: string; status?: string }>,
  edges: BomEdge[],
  maxDepth: number = 20
): BomTreeNode {
  const rootPart = parts.get(rootPartId);
  if (!rootPart) {
    throw new Error(`Part ${rootPartId} not found`);
  }

  // Build adjacency list with position info
  const adj = new Map<string, Array<{ edge: BomEdge; childId: string }>>();
  for (const edge of edges) {
    if (!adj.has(edge.parentId)) {
      adj.set(edge.parentId, []);
    }
    adj.get(edge.parentId)!.push({ edge, childId: edge.childId });
  }

  // Recursive build function
  const buildNode = (
    partId: string,
    level: number,
    path: string,
    visited: Set<string>,
    parentQuantity: string = "1",
    parentUnit: string = "EA"
  ): BomTreeNode => {
    if (level > maxDepth) {
      throw new Error(`Maximum BOM depth ${maxDepth} exceeded`);
    }

    if (visited.has(partId)) {
      throw new Error(`Cycle detected at part ${partId}`);
    }

    visited.add(partId);

    const part = parts.get(partId);
    if (!part) {
      throw new Error(`Part ${partId} not found`);
    }

    // Get children edges sorted by position
    const childEdges = adj.get(partId) || [];
    childEdges.sort((a, b) => (a.edge.position || 0) - (b.edge.position || 0));

    // Build child nodes
    const children: BomTreeNode[] = [];
    for (const { edge, childId } of childEdges) {
      const childPath = path ? `${path} > ${part.partNumber}` : part.partNumber;
      const childVisited = new Set(visited);
      const childNode = buildNode(
        childId,
        level + 1,
        childPath,
        childVisited,
        edge.quantity,
        edge.unit || "EA"
      );

      // Override quantity and unit from edge
      childNode.quantity = edge.quantity;
      childNode.unit = edge.unit || "EA";
      childNode.position = edge.position;
      childNode.notes = edge.notes;

      children.push(childNode);
    }

    return {
      partId: part.id,
      partNumber: part.partNumber,
      name: part.name,
      description: part.description,
      category: part.category,
      status: (part.status || "draft") as PartStatus,
      quantity: level === 0 ? "1" : parentQuantity, // Root has quantity 1, children get from parent edge
      unit: level === 0 ? "EA" : parentUnit,
      level,
      path,
      children,
    };
  };

  return buildNode(rootPartId, 0, rootPart.partNumber, new Set());
}

/**
 * Flatten BOM tree to flat list for table display
 *
 * @param tree - BOM tree root
 * @returns Flat list of BOM items
 */
export function flattenBomTree(tree: BomTreeNode): FlatBomItem[] {
  const result: FlatBomItem[] = [];

  const flatten = (node: BomTreeNode) => {
    result.push({
      partId: node.partId,
      partNumber: node.partNumber,
      name: node.name,
      description: node.description,
      category: node.category,
      status: node.status as "draft" | "active" | "obsolete",
      quantity: node.quantity,
      unit: node.unit,
      level: node.level,
      path: node.path,
      position: node.position,
    });

    for (const child of node.children) {
      // Override quantity/unit from parent edge
      const edge = node.children.find((c: BomTreeNode) => c.partId === child.partId);
      child.quantity = edge?.quantity || child.quantity;
      child.unit = edge?.unit || child.unit;
      flatten(child);
    }
  };

  // Special handling: root quantity is always 1
  const rootWithQuantity = {
    ...tree,
    quantity: "1",
    unit: "EA",
  };

  flatten(rootWithQuantity);
  return result;
}

/**
 * Calculate total quantity of a part in the BOM tree
 * Accounts for multiple occurrences (diamond structures)
 *
 * @param tree - BOM tree root
 * @param targetPartId - Part ID to calculate
 * @returns Total quantity needed
 */
export function calculateTotalQuantity(
  tree: BomTreeNode,
  targetPartId: string
): string {
  let total = 0;

  const calculate = (node: BomTreeNode, multiplier: number) => {
    if (node.partId === targetPartId) {
      total += multiplier;
    }

    for (const child of node.children) {
      const childQty = parseFloat(child.quantity) || 1;
      calculate(child, multiplier * childQty);
    }
  };

  calculate(tree, 1);
  return total.toString();
}

/**
 * Find all parents that use a given part (Where-Used query)
 *
 * @param partId - Part ID to find
 * @param edges - All BOM relationships
 * @returns Array of parent part IDs
 */
export function findWhereUsed(partId: string, edges: BomEdge[]): string[] {
  const parents: string[] = [];

  for (const edge of edges) {
    if (edge.childId === partId) {
      parents.push(edge.parentId);
    }
  }

  return parents;
}

/**
 * Validate BOM tree structure
 * Checks for cycles, missing parts, and depth limits
 *
 * @param rootPartId - Root part ID
 * @param parts - Map of part data
 * @param edges - BOM relationships
 * @param maxDepth - Maximum allowed depth
 * @returns Object with validation result and errors
 */
export function validateBomTree(
  rootPartId: string,
  parts: Map<string, any>,
  edges: BomEdge[],
  maxDepth: number = 20
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check root part exists
  if (!parts.has(rootPartId)) {
    errors.push(`Root part ${rootPartId} not found`);
    return { valid: false, errors };
  }

  // Check for cycles using DFS
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.parentId)) {
      adj.set(edge.parentId, []);
    }
    adj.get(edge.parentId)!.push(edge.childId);
  }

  const checkDepth = (partId: string, depth: number, visited: Set<string>): void => {
    if (depth > maxDepth) {
      errors.push(`Maximum depth ${maxDepth} exceeded at part ${partId}`);
      return;
    }

    if (visited.has(partId)) {
      errors.push(`Cycle detected at part ${partId}`);
      return;
    }

    visited.add(partId);

    // Check all child parts exist
    const children = adj.get(partId) || [];
    for (const childId of children) {
      if (!parts.has(childId)) {
        errors.push(`Child part ${childId} not found (referenced by ${partId})`);
      }
      checkDepth(childId, depth + 1, new Set(visited));
    }
  };

  checkDepth(rootPartId, 0, new Set());

  return {
    valid: errors.length === 0,
    errors,
  };
}
