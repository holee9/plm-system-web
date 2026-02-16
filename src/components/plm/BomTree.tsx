"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Package,
  FileText,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { BomTreeNode } from "@/modules/plm/types";
import { PartStatusBadge } from "./PartStatusBadge";

// ============================================================================
// Types
// ============================================================================

interface BomTreeProps {
  nodes: BomTreeNode[];
  level?: number;
  maxDepth?: number;
  onNodeClick?: (node: BomTreeNode) => void;
  filter?: BomTreeFilter;
}

export interface BomTreeFilter {
  query?: string;
  statuses?: ("draft" | "active" | "obsolete")[];
  categories?: string[];
}

interface BomTreeNodeComponentProps {
  node: BomTreeNode;
  level: number;
  maxDepth: number;
  onNodeClick?: (node: BomTreeNode) => void;
  filter?: BomTreeFilter;
  isFiltered?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * BOM Tree visualization component
 * Displays hierarchical bill of materials with expand/collapse, filtering, and tooltips
 */
export function BomTree({
  nodes,
  level = 0,
  maxDepth = 5,
  onNodeClick,
  filter
}: BomTreeProps) {
  const filteredNodes = useMemo(() => {
    if (!filter) return nodes;
    return filterNodes(nodes, filter);
  }, [nodes, filter]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No BOM items found</p>
        {filter?.query && (
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search criteria
          </p>
        )}
      </div>
    );
  }

  if (filteredNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No items match your filter</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-0.5">
        {filteredNodes.map((node) => (
          <BomTreeNodeComponent
            key={node.path}
            node={node}
            level={level}
            maxDepth={maxDepth}
            onNodeClick={onNodeClick}
            filter={filter}
            isFiltered={!filter || filter?.query !== undefined}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// Tree Node Component
// ============================================================================

function BomTreeNodeComponent({
  node,
  level,
  maxDepth,
  onNodeClick,
  filter,
  isFiltered
}: BomTreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(
    // Auto-expand first 2 levels by default
    level < 2 ||
      // Expand all if filtering
      (isFiltered && level < maxDepth)
  );

  const hasChildren = node.children && node.children.length > 0;
  const isAtMaxDepth = level >= maxDepth;

  // Filter children if filter is provided
  const filteredChildren = useMemo(() => {
    if (!filter || !hasChildren) return node.children;
    return filterNodes(node.children, filter);
  }, [node.children, filter, hasChildren]);

  const hasFilteredChildren = filteredChildren.length > 0;

  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Calculate node styles
  const nodeStyle = {
    paddingLeft: `${level * 24 + 12}px`
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      {/* Tree Node Row */}
      <div
        className={`
          group relative flex items-start gap-2 py-2 pr-3 rounded-md
          hover:bg-muted/50 transition-colors cursor-pointer
          ${onNodeClick ? "cursor-pointer" : "cursor-default"}
        `}
        style={nodeStyle}
        onClick={handleClick}
        role="treeitem"
        aria-expanded={isExpanded}
        aria-level={level + 1}
      >
        {/* Tree Guide Lines */}
        {level > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-6 border-l border-b border-muted-foreground/20"
            style={{
              left: `${(level - 1) * 24 + 12}px`
            }}
          />
        )}

        {/* Expand/Collapse Toggle */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            disabled={!hasChildren || isAtMaxDepth}
            onClick={handleToggle}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {hasChildren && !isAtMaxDepth ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          {/* Primary Info Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Part Icon */}
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />

            {/* Part Number */}
            <span className="font-medium text-sm">{node.partNumber}</span>

            {/* Separator */}
            <span className="text-muted-foreground text-xs">·</span>

            {/* Part Name */}
            <span className="text-sm truncate">{node.name}</span>

            {/* Quantity Badge with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {node.quantity} {node.unit}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quantity: {node.quantity}</p>
                <p className="text-xs text-muted-foreground">
                  Unit: {node.unit}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Status Badge */}
            <PartStatusBadge status={node.status} />

            {/* Position Indicator */}
            {node.position !== undefined && node.position > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    #{node.position}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Position in BOM: {node.position}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Secondary Info */}
          {(node.description || node.category || node.notes) && (
            <div className="mt-1 space-y-1">
              {/* Description */}
              {node.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {node.description}
                </p>
              )}

              {/* Category */}
              {node.category && (
                <Badge variant="secondary" className="text-xs">
                  {node.category}
                </Badge>
              )}

              {/* Notes */}
              {node.notes && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                      <Info className="h-3 w-3" />
                      <span className="line-clamp-1">Notes available</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{node.notes}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Path Breadcrumb (for deep levels) */}
          {level > 2 && (
            <div className="mt-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground cursor-help line-clamp-1">
                    {node.path}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <p className="text-xs">Full path: {node.path}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Children Container */}
      {hasChildren && hasFilteredChildren && !isAtMaxDepth && (
        <CollapsibleContent className="space-y-0.5">
          {filteredChildren.map((child) => (
            <BomTreeNodeComponent
              key={`${node.path}-${child.partNumber}`}
              node={child}
              level={level + 1}
              maxDepth={maxDepth}
              onNodeClick={onNodeClick}
              filter={filter}
              isFiltered={isFiltered}
            />
          ))}
        </CollapsibleContent>
      )}

      {/* Max Depth Indicator */}
      {isAtMaxDepth && hasChildren && (
        <div
          className="text-xs text-muted-foreground italic ml-12"
          style={{ paddingLeft: `${(level + 1) * 24 + 12}px` }}
        >
          + {filteredChildren.length} more item
          {filteredChildren.length !== 1 ? "s" : ""} (max depth reached)
        </div>
      )}
    </Collapsible>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter BOM tree nodes based on search criteria
 */
function filterNodes(
  nodes: BomTreeNode[],
  filter: BomTreeFilter
): BomTreeNode[] {
  return nodes.filter((node) => {
    // Status filter
    if (filter.statuses && filter.statuses.length > 0) {
      if (!filter.statuses.includes(node.status as any)) {
        return false;
      }
    }

    // Category filter
    if (filter.categories && filter.categories.length > 0) {
      if (!node.category || !filter.categories.includes(node.category)) {
        return false;
      }
    }

    // Query filter (search in part number, name, description)
    if (filter.query) {
      const query = filter.query.toLowerCase();
      const searchableText = [
        node.partNumber,
        node.name,
        node.description,
        node.category,
        node.notes
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
