"use client";

import { ExternalLink, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WhereUsedResponse } from "@/modules/plm/types";

interface WhereUsedTableProps {
  partNumber: string;
  parents: WhereUsedResponse["parents"];
}

export function WhereUsedTable({ partNumber, parents }: WhereUsedTableProps) {
  if (!parents || parents.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        This part is not used in any parent assemblies
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parent Part Number</TableHead>
            <TableHead>Parent Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.map((parent, index) => (
            <TableRow key={`${parent.partId}-${index}`}>
              <TableCell className="font-medium">{parent.partNumber}</TableCell>
              <TableCell>{parent.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {parent.quantity} {parent.unit}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-sm truncate">
                    {parent.path}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={`/projects/${parent.partId}/parts/${parent.partId}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
