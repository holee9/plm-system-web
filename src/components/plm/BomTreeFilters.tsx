"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { BomTreeFilter } from "./BomTree";

interface BomTreeFiltersProps {
  filter: BomTreeFilter;
  onFilterChange: (filter: BomTreeFilter) => void;
  categories?: string[];
  className?: string;
}

const PART_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-partStatus-draft" },
  { value: "active", label: "Active", color: "bg-partStatus-released" },
  { value: "obsolete", label: "Obsolete", color: "bg-partStatus-obsolete" }
] as const;

/**
 * BOM Tree filter controls
 * Provides search input and filter options for status and category
 */
export function BomTreeFilters({
  filter,
  onFilterChange,
  categories = [],
  className
}: BomTreeFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters =
    filter.query ||
    (filter.statuses && filter.statuses.length > 0) ||
    (filter.categories && filter.categories.length > 0);

  const handleQueryChange = (query: string) => {
    onFilterChange({ ...filter, query });
  };

  const handleStatusToggle = (status: "draft" | "active" | "obsolete") => {
    const currentStatuses = filter.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFilterChange({ ...filter, statuses: newStatuses });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filter.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFilterChange({ ...filter, categories: newCategories });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFilterCount =
    (filter.statuses?.length || 0) + (filter.categories?.length || 0);

  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search parts..."
          value={filter.query || ""}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 h-9"
        />
        {filter.query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => handleQueryChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Part Status</Label>
            </div>
            <div className="space-y-2">
              {PART_STATUSES.map((status) => (
                <div key={status.value} className="flex items-center gap-3">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filter.statuses?.includes(status.value) || false}
                    onCheckedChange={() =>
                      handleStatusToggle(status.value)
                    }
                  />
                  <Label
                    htmlFor={`status-${status.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${status.color}`}
                    />
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-3 mt-4 pt-4 border-t">
              <Label className="text-sm font-medium">Category</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center gap-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filter.categories?.includes(category) || false}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="cursor-pointer flex-1"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
