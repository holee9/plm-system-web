import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

export interface BOMPart {
  id: string;
  level: number;
  partNumber: string;
  name: string;
  quantity: number;
  unit: string;
  revision: string;
  status: "released" | "approved" | "pending" | "draft";
  expandable?: boolean;
  indent?: number;
  supplier?: string;
  children?: BOMPart[];
}

interface BOMTableProps {
  parts: BOMPart[];
  onPartView?: (part: BOMPart) => void;
  onPartEdit?: (part: BOMPart) => void;
  onPartDelete?: (part: BOMPart) => void;
  className?: string;
}

export function BOMTable({
  parts,
  onPartView,
  onPartEdit,
  onPartDelete,
  className,
}: BOMTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (partId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedRows(newExpanded);
  };

  const renderPart = (part: BOMPart, depth = 0): React.ReactNode => {
    const isExpanded = expandedRows.has(part.id);
    const hasChildren = part.children && part.children.length > 0;
    const indentWidth = depth * 20;

    return (
      <React.Fragment key={part.id}>
        <TableRow className="group">
          <TableCell className="w-10">
            <div className="flex items-center" style={{ paddingLeft: `${indentWidth}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleRow(part.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <span className="w-6 text-center text-muted-foreground">
                  {part.level}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
          <TableCell>
            <div className="flex flex-col">
              <span className="font-medium">{part.name}</span>
              {part.supplier && (
                <span className="text-xs text-muted-foreground">{part.supplier}</span>
              )}
            </div>
          </TableCell>
          <TableCell className="w-16 text-center">{part.quantity}</TableCell>
          <TableCell className="w-16">{part.unit}</TableCell>
          <TableCell className="w-16 font-mono text-xs">{part.revision}</TableCell>
          <TableCell className="w-24">
            <StatusBadge status={part.status} />
          </TableCell>
          <TableCell className="w-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPartView && (
                  <DropdownMenuItem onClick={() => onPartView(part)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                )}
                {onPartEdit && (
                  <DropdownMenuItem onClick={() => onPartEdit(part)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onPartDelete && (
                  <DropdownMenuItem
                    onClick={() => onPartDelete(part)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && part.children?.map((child) => renderPart(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10">Lvl</TableHead>
            <TableHead>Part Number</TableHead>
            <TableHead>Part Name</TableHead>
            <TableHead className="w-16 text-center">Qty</TableHead>
            <TableHead className="w-16">Unit</TableHead>
            <TableHead className="w-16">Rev</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">No parts found</p>
                  <p className="text-xs text-muted-foreground">
                    Add parts to get started
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            parts.map((part) => renderPart(part))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
