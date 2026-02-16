"use client";

import { Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PartStatusBadge } from "./PartStatusBadge";
import type { FlatBomItem } from "@/modules/plm/types";

interface BomFlatTableProps {
  items: FlatBomItem[];
}

export function BomFlatTable({ items }: BomFlatTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No BOM items found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Level</TableHead>
            <TableHead>Part Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[120px]">Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Total Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.path}-${index}`}>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {item.level}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{item.partNumber}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {item.description || "-"}
              </TableCell>
              <TableCell>{item.category || "-"}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {item.quantity} {item.unit}
                </Badge>
              </TableCell>
              <TableCell>
                <PartStatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                {item.totalQuantity ? (
                  <Badge variant="outline" className="font-mono">
                    {item.totalQuantity}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
