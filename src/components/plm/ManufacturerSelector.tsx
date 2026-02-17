"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Search, ChevronDown } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ManufacturerSelectorProps {
  partId: string;
  selectedIds?: string[];
  onSelectionChange?: (manufacturers: any[]) => void;
  disabled?: boolean;
}

export function ManufacturerSelector({
  partId,
  selectedIds = [],
  onSelectionChange,
  disabled = false,
}: ManufacturerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all manufacturers
  const { data: manufacturersData, isLoading } = trpc.plm.manufacturer.list.useQuery({
    query: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  // Fetch currently linked manufacturers for this part
  const { data: linkedManufacturers, refetch } = trpc.plm.part.manufacturers.useQuery(
    { partId },
    { enabled: !!partId }
  );

  // Link mutation
  const linkMutation = trpc.plm.part.linkManufacturer.useMutation({
    onSuccess: () => {
      toast.success("Manufacturer linked successfully");
      refetch();
      onSelectionChange?.(linkedManufacturers || []);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Unlink mutation
  const unlinkMutation = trpc.plm.part.unlinkManufacturer.useMutation({
    onSuccess: () => {
      toast.success("Manufacturer unlinked successfully");
      refetch();
      onSelectionChange?.(linkedManufacturers?.filter((m: any) => unlinkMutation.variables && m.id !== unlinkMutation.variables.manufacturerId) || []);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const manufacturers = manufacturersData?.manufacturers || [];

  const handleLink = async (manufacturerId: string) => {
    if (!partId) return;

    // Check if already linked
    const alreadyLinked = linkedManufacturers?.some((m: any) => m.id === manufacturerId);
    if (alreadyLinked) {
      toast.info("Manufacturer already linked to this part");
      return;
    }

    linkMutation.mutate({
      partId,
      manufacturerId,
    });
  };

  const handleUnlink = (manufacturerId: string) => {
    if (!partId) return;

    unlinkMutation.mutate({
      partId,
      manufacturerId,
    });
  };

  const isLinked = (manufacturerId: string) => {
    return linkedManufacturers?.some((m: any) => m.id === manufacturerId);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {linkedManufacturers?.map((manufacturer: any) => (
          <Badge
            key={manufacturer.id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span className="font-medium">{manufacturer.code}</span>
            <span>: {manufacturer.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleUnlink(manufacturer.id)}
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
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading manufacturers...
                </div>
              ) : manufacturers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No manufacturers found
                </div>
              ) : (
                manufacturers.map((manufacturer: any) => {
                  const linked = isLinked(manufacturer.id);
                  return (
                    <button
                      key={manufacturer.id}
                      type="button"
                      onClick={() => {
                        handleLink(manufacturer.id);
                        setSearchQuery("");
                      }}
                      disabled={linked || linkMutation.isPending}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <span className="font-medium">{manufacturer.code}</span>
                        <span className="ml-2 text-muted-foreground">{manufacturer.name}</span>
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
            Add Manufacturer
          </Button>
        )}
      </div>
    </div>
  );
}
