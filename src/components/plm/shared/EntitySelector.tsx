"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Search } from "lucide-react";
import { TRPCClientUtilsLike } from "@trpc/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Entity {
  id: string;
  code: string;
  name: string;
}

interface EntitySelectorConfig {
  entityName: string;
  entityNameCapitalized: string;
  listQuery: any;
  linkedQuery: any;
  linkMutation: any;
  unlinkMutation: any;
}

interface EntitySelectorProps {
  partId: string;
  selectedIds?: string[];
  onSelectionChange?: (entities: any[]) => void;
  disabled?: boolean;
  config: EntitySelectorConfig;
  utils: TRPCClientUtilsLike;
}

export function EntitySelector({
  partId,
  selectedIds = [],
  onSelectionChange,
  disabled = false,
  config,
  utils,
}: EntitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    entityName,
    entityNameCapitalized,
    listQuery,
    linkedQuery,
    linkMutation,
    unlinkMutation,
  } = config;

  // Fetch all entities
  const { data: entitiesData, isLoading } = listQuery.useQuery({
    query: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  // Fetch currently linked entities for this part
  const { data: linkedEntities } = linkedQuery.useQuery(
    { partId },
    { enabled: !!partId }
  );

  // Link mutation
  const linkMutate = linkMutation.useMutation({
    onSuccess: () => {
      toast.success(`${entityNameCapitalized} linked successfully`);
      void linkedQuery.invalidate({ partId });
      onSelectionChange?.(linkedEntities || []);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Unlink mutation
  const unlinkMutate = unlinkMutation.useMutation({
    onSuccess: () => {
      toast.success(`${entityNameCapitalized} unlinked successfully`);
      void linkedQuery.invalidate({ partId });
      const entityIdKey = `${entityName}Id` as keyof { manufacturerId: string; supplierId: string };
      onSelectionChange?.(
        linkedEntities?.filter((e: any) => unlinkMutate.variables && e.id !== (unlinkMutate.variables as any)[entityIdKey]) || []
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const entities = entitiesData?.[entityName === "manufacturer" ? "manufacturers" : "suppliers"] || [];

  const handleLink = async (entityId: string) => {
    if (!partId) return;

    // Check if already linked
    const alreadyLinked = linkedEntities?.some((e: any) => e.id === entityId);
    if (alreadyLinked) {
      toast.info(`${entityNameCapitalized} already linked to this part`);
      return;
    }

    const entityIdKey = `${entityName}Id` as keyof { manufacturerId: string; supplierId: string };
    linkMutate.mutate({
      partId,
      [entityIdKey]: entityId,
    } as any);
  };

  const handleUnlink = (entityId: string) => {
    if (!partId) return;

    const entityIdKey = `${entityName}Id` as keyof { manufacturerId: string; supplierId: string };
    unlinkMutate.mutate({
      partId,
      [entityIdKey]: entityId,
    } as any);
  };

  const isLinked = (entityId: string) => {
    return linkedEntities?.some((e: any) => e.id === entityId);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {linkedEntities?.map((entity: Entity) => (
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
                disabled={unlinkMutate.isPending}
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
                placeholder={`Search ${entityName}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Loading {entityName}s...
                </div>
              ) : entities.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No {entityName}s found
                </div>
              ) : (
                entities.map((entity: Entity) => {
                  const linked = isLinked(entity.id);
                  return (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => {
                        handleLink(entity.id);
                        setSearchQuery("");
                      }}
                      disabled={linked || linkMutate.isPending}
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
            disabled={linkMutate.isPending}
          >
            <Search className="mr-1 h-3 w-3" />
            Add {entityNameCapitalized}
          </Button>
        )}
      </div>
    </div>
  );
}
