// This is an example of how to use the BomTree component
// Import these components in your page or component

"use client";

import { useState, useMemo } from "react";
import { BomTree, BomTreeFilters, type BomTreeFilter } from "@/components/plm";
import type { BomTreeNode } from "@/modules/plm/types";

// Example BOM tree data
const exampleBomTree: BomTreeNode[] = [
  {
    partId: "1",
    partNumber: "ASM-001",
    name: "Main Assembly",
    description: "Primary product assembly",
    category: "Assembly",
    status: "active",
    quantity: "1",
    unit: "EA",
    level: 0,
    path: "ASM-001",
    position: 1,
    children: [
      {
        partId: "2",
        partNumber: "SUB-ASM-001",
        name: "Sub-Assembly A",
        description: "Secondary assembly unit",
        category: "Assembly",
        status: "active",
        quantity: "2",
        unit: "EA",
        level: 1,
        path: "ASM-001 > SUB-ASM-001",
        position: 1,
        notes: "Critical component - handle with care",
        children: [
          {
            partId: "4",
            partNumber: "PART-001",
            name: "Bracket",
            description: "Mounting bracket",
            category: "Hardware",
            status: "active",
            quantity: "4",
            unit: "EA",
            level: 2,
            path: "ASM-001 > SUB-ASM-001 > PART-001",
            position: 1,
            children: []
          },
          {
            partId: "5",
            partNumber: "PART-002",
            name: "Bolt M6",
            description: "Hex bolt M6x20",
            category: "Hardware",
            status: "active",
            quantity: "8",
            unit: "EA",
            level: 2,
            path: "ASM-001 > SUB-ASM-001 > PART-002",
            position: 2,
            children: []
          }
        ]
      },
      {
        partId: "3",
        partNumber: "PART-003",
        name: "Panel Cover",
        description: "Front panel cover",
        category: "Sheet Metal",
        status: "active",
        quantity: "1",
        unit: "EA",
        level: 1,
        path: "ASM-001 > PART-003",
        position: 2,
        children: []
      }
    ]
  }
];

/**
 * Example usage of BomTree component with filtering
 */
export function ExampleBomTreePage() {
  const [filter, setFilter] = useState<BomTreeFilter>({});
  const [selectedNode, setSelectedNode] = useState<BomTreeNode | null>(null);

  // Extract unique categories from tree
  const categories = useMemo(() => {
    const extractCategories = (nodes: BomTreeNode[]): string[] => {
      const cats: string[] = [];
      for (const node of nodes) {
        if (node.category && !cats.includes(node.category)) {
          cats.push(node.category);
        }
        if (node.children) {
          cats.push(...extractCategories(node.children));
        }
      }
      return cats;
    };
    return [...new Set(extractCategories(exampleBomTree))].sort();
  }, []);

  const handleNodeClick = (node: BomTreeNode) => {
    setSelectedNode(node);
    // You can navigate to part detail page, show modal, etc.
    console.log("Selected part:", node);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bill of Materials</h1>
        <p className="text-muted-foreground">
          Hierarchical view of product structure
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <BomTreeFilters
          filter={filter}
          onFilterChange={setFilter}
          categories={categories}
        />
      </div>

      {/* BOM Tree */}
      <div className="border rounded-lg p-4 bg-card">
        <BomTree
          nodes={exampleBomTree}
          maxDepth={5}
          onNodeClick={handleNodeClick}
          filter={filter}
        />
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-6 border rounded-lg p-4 bg-card">
          <h2 className="text-lg font-semibold mb-3">Selected Part</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Part Number:</span>{" "}
              {selectedNode.partNumber}
            </div>
            <div>
              <span className="font-medium">Name:</span> {selectedNode.name}
            </div>
            <div>
              <span className="font-medium">Quantity:</span>{" "}
              {selectedNode.quantity} {selectedNode.unit}
            </div>
            <div>
              <span className="font-medium">Status:</span> {selectedNode.status}
            </div>
            {selectedNode.description && (
              <div className="col-span-2">
                <span className="font-medium">Description:</span>{" "}
                {selectedNode.description}
              </div>
            )}
            {selectedNode.path && (
              <div className="col-span-2">
                <span className="font-medium">Path:</span> {selectedNode.path}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
