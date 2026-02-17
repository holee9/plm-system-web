"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Filter, Download } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PartStatusBadge } from "./PartStatusBadge";
import type { PartStatus } from "@/modules/plm/types";

interface PartListProps {
  projectId: string;
}

export function PartList({ projectId }: PartListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PartStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch parts
  const { data, isLoading, refetch } = trpc.plm.part.list.useQuery({
    projectId,
    query: searchQuery || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit,
    offset: (page - 1) * limit,
  });

  // Get unique categories from data
  const categories = data?.parts
    ? Array.from(new Set(data.parts.map((p: any) => p.category).filter(Boolean)))
    : [];

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const handleExportCSV = () => {
    if (!data?.parts.length) return;

    const headers = ["Part Number", "Name", "Description", "Category", "Status", "Revision"];
    const rows = data.parts.map((part: any) => [
      part.partNumber,
      part.name,
      part.description || "",
      part.category || "",
      part.status,
      part.currentRevision?.revisionCode || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parts-${projectId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Parts exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parts</h1>
          <p className="text-muted-foreground">
            Manage parts and Bill of Materials
          </p>
        </div>
        <Button onClick={() => window.location.href = `/projects/${projectId}/parts/new`}>
          <Plus className="mr-2 h-4 w-4" />
          New Part
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by part number, name, or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat || "empty"} value={cat || "empty"}>
                {cat || "Uncategorized"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as PartStatus | "all"); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="obsolete">Obsolete</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {data?.parts.length || 0} of {data?.total || 0} parts
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading parts...
                </TableCell>
              </TableRow>
            ) : data?.parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No parts found. Create your first part to get started.
                </TableCell>
              </TableRow>
            ) : (
              data?.parts.map((part: any) => (
                <TableRow
                  key={part.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => (window.location.href = `/projects/${projectId}/parts/${part.id}`)}
                >
                  <TableCell className="font-medium">{part.partNumber}</TableCell>
                  <TableCell>{part.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {part.description || "-"}
                  </TableCell>
                  <TableCell>{part.category || "-"}</TableCell>
                  <TableCell>
                    <PartStatusBadge status={part.status as PartStatus} />
                  </TableCell>
                  <TableCell>{part.currentRevision?.revisionCode || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/projects/${projectId}/parts/${part.id}`;
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
