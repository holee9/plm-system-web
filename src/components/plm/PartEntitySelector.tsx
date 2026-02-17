"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Search } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * Entity type for part relationship selector
 */
type PartEntityType = "manufacturer" | "supplier";

/**
 * Configuration for each entity type
 */
interface EntityConfig {
  name: string;
  nameCapitalized: string;
  listQuery: any;
  linkedQuery: any;
  linkMutation: any;
  unlinkMutation: any;
  dataKey: string;
  idParam: string;
}

/**
 * Get entity-specific configuration
 */
function getEntityConfig(entityType: PartEntityType): EntityConfig {
  const configs: Record<PartEntityType, EntityConfig> = {
    manufacturer: {
      name: "manufacturer",
      nameCapitalized: "Manufacturer",
      listQuery: (trpc as any).plm.manufacturer.list.useQuery,
      linkedQuery: (trpc as any).plm.part.manufacturers.useQuery,
      linkMutation: (trpc as any).plm.part.linkManufacturer.useMutation,
      unlinkMutation: (trpc as any).plm.part.unlinkManufacturer.useMutation,
      dataKey: "manufacturers",
      idParam: "manufacturerId",
    },
    supplier: {
      name: "supplier",
      nameCapitalized: "Supplier",
      listQuery: (trpc as any).plm.supplier.list.useQuery,
      linkedQuery: (trpc as any).plm.part.suppliers.useQuery,
      linkMutation: (trpc as any).plm.part.linkSupplier.useMutation,
      unlinkMutation: (trpc as any).plm.part.unlinkSupplier.useMutation,
      dataKey: "suppliers",
      idParam: "supplierId",
    },
  };
  return configs[entityType];
}

export interface PartEntitySelectorProps {
  partId: string;
  entityType: PartEntityType;
  selectedIds?: string[];
  onSelectionChange?: (entities: any[]) => void;
  disabled?: boolean;
}

export function PartEntitySelector({
  partId,
  entityType,
  selectedIds = [],
  onSelectionChange,
  disabled = false,
}: PartEntitySelectorProps) {
  const config = getEntityConfig(entityType);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const utils = trpc.useUtils();

  // Fetch all entities
  const { data: entitiesData, isLoading } = config.listQuery({
    query: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  // Fetch currently linked entities for this part
  const { data: linkedEntities } = config.linkedQuery(
    { partId },
    { enabled: !!partId }
  );

  // Link mutation
  const linkMutation = config.linkMutation({
    onSuccess: () => {
      toast.success(`${config.nameCapitalized} linked successfully`);
      // Type-safe cache invalidation
      if (config.dataKey === "manufacturers") {
        void utils.plm.part.manufacturers.invalidate({ partId });
      } else {
        void utils.plm.part.suppliers.invalidate({ partId });
      }
      onSelectionChange?.(linkedEntities || []);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Unlink mutation
  const unlinkMutation = config.unlinkMutation({
    onSuccess: () => {
      toast.success(`${config.nameCapitalized} unlinked successfully`);
      // Type-safe cache invalidation
      if (config.dataKey === "manufacturers") {
        void utils.plm.part.manufacturers.invalidate({ partId });
      } else {
        void utils.plm.part.suppliers.invalidate({ partId });
      }
      const idParam = config.idParam;
      onSelectionChange?.(
        linkedEntities?.filter((e: any) => unlinkMutation.variables && e.id !== unlinkMutation.variables[idParam]) || []
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const entities = entitiesData?.[config.dataKey] || [];

  const handleLink = async (entityId: string) => {
    if (!partId) return;

    const alreadyLinked = linkedEntities?.some((e: any) => e.id === entityId);
    if (alreadyLinked) {
      toast.info(`${config.nameCapitalized} already linked to this part`);
      return;
    }

    linkMutation.mutate({
      partId,
      [config.idParam]: entityId,
    });
  };

  const handleUnlink = (entityId: string) => {
    if (!partId) return;

    unlinkMutation.mutate({
      partId,
      [config.idParam]: entityId,
    });
  };

  const isLinked = (entityId: string) => {
    return linkedEntities?.some((e: any) => e.id === entityId);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {linkedEntities?.map((entity: any) => (
          <Badge
            key={entity.id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span className="font-medium">{entity.code}</span>
            <span>: {entity.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleUnlink(entity.id)}
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
                placeholder={`Search ${config.name}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading {config.name}s...
                </div>
              ) : entities.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No {config.name}s found
                </div>
              ) : (
                entities.map((entity: any) => {
                  const linked = isLinked(entity.id);
                  return (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => {
                        handleLink(entity.id);
                        setSearchQuery("");
                      }}
                      disabled={linked || linkMutation.isPending}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div>
                        <span className="font-medium">{entity.code}</span>
                        <span className="ml-2 text-muted-foreground">{entity.name}</span>
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
            Add {config.nameCapitalized}
          </Button>
        )}
      </div>
    </div>
  );
}
