"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Search } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SupplierSelectorProps {
  partId: string;
  selectedIds?: string[];
  onSelectionChange?: (suppliers: any[]) => void;
  disabled?: boolean;
}

export function SupplierSelector({
  partId,
  selectedIds = [],
  onSelectionChange,
  disabled = false,
}: SupplierSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all suppliers
  const { data: suppliersData, isLoading } = trpc.plm.supplier.list.useQuery({
    query: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  // Fetch currently linked suppliers for this part
  const { data: linkedSuppliers, refetch } = trpc.plm.part.suppliers.useQuery(
    { partId },
    { enabled: !!partId }
  );

  // Link mutation
  const linkMutation = trpc.plm.part.linkSupplier.useMutation({
    onSuccess: () => {
      toast.success("Supplier linked successfully");
      refetch();
      onSelectionChange?.(linkedSuppliers || []);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Unlink mutation
  const unlinkMutation = trpc.plm.part.unlinkSupplier.useMutation({
    onSuccess: () => {
      toast.success("Supplier unlinked successfully");
      refetch();
      onSelectionChange?.(linkedSuppliers?.filter((s: any) => unlinkMutation.variables && s.id !== unlinkMutation.variables.supplierId) || []);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const suppliers = suppliersData?.suppliers || [];

  const handleLink = async (supplierId: string) => {
    if (!partId) return;

    // Check if already linked
    const alreadyLinked = linkedSuppliers?.some((s: any) => s.id === supplierId);
    if (alreadyLinked) {
      toast.info("Supplier already linked to this part");
      return;
    }

    linkMutation.mutate({
      partId,
      supplierId,
    });
  };

  const handleUnlink = (supplierId: string) => {
    if (!partId) return;

    unlinkMutation.mutate({
      partId,
      supplierId,
    });
  };

  const isLinked = (supplierId: string) => {
    return linkedSuppliers?.some((s: any) => s.id === supplierId);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {linkedSuppliers?.map((supplier: any) => (
          <Badge
            key={supplier.id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span className="font-medium">{supplier.code}</span>
            <span>: {supplier.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleUnlink(supplier.id)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                disabled={unlinkMutation.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {!disabled && open && (
          <div className="w-full max-w-md space-y-2 border rounded-lg p-3 bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading suppliers...
                </div>
              ) : suppliers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No suppliers found
                </div>
              ) : (
                suppliers.map((supplier: any) => {
                  const linked = isLinked(supplier.id);
                  return (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => {
                        handleLink(supplier.id);
                        setSearchQuery("");
                      }}
                      disabled={linked || linkMutation.isPending}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <span className="font-medium">{supplier.code}</span>
                        <span className="ml-2 text-muted-foreground">{supplier.name}</span>
                      </div>
                      {linked && (
                        <Badge variant="secondary" className="text-xs">
                          Linked
                        </Badge>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                setSearchQuery("");
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
        {!disabled && !open && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={linkMutation.isPending}
          >
            <Search className="mr-1 h-3 w-3" />
            Add Supplier
          </Button>
        )}
      </div>
    </div>
  );
}
