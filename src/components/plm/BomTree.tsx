"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { BomTreeNode } from "@/modules/plm/types";
import { PartStatusBadge } from "./PartStatusBadge";

interface BomTreeProps {
  nodes: BomTreeNode[];
  level?: number;
}

export function BomTree({ nodes, level = 0 }: BomTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No BOM items found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <BomTreeNodeComponent key={node.path} node={node} level={level} />
      ))}
    </div>
  );
}

interface BomTreeNodeComponentProps {
  node: BomTreeNode;
  level: number;
}

function BomTreeNodeComponent({ node, level }: BomTreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className="flex items-start gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            disabled={!hasChildren}
            onClick={handleClick}
          >
            {hasChildren ? (
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{node.partNumber}</span>
            <span className="text-muted-foreground">·</span>
            <span className="truncate">{node.name}</span>
            <Badge variant="outline" className="shrink-0">
              {node.quantity} {node.unit}
            </Badge>
            <PartStatusBadge status={node.status} />
          </div>

          {node.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {node.description}
            </p>
          )}

          {node.category && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {node.category}
            </Badge>
          )}

          {node.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Note: {node.notes}
            </p>
          )}
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent className="space-y-1">
          <BomTree nodes={node.children} level={level + 1} />
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
