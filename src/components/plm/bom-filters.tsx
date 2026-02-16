import { cn } from "@/lib/utils";

export interface BOMFilter {
  label: string;
  value: string;
  active?: boolean;
}

interface BOMFiltersProps {
  filters: BOMFilter[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
}

export function BOMFilters({
  filters,
  activeFilter,
  onFilterChange,
  className,
}: BOMFiltersProps) {
  return (
    <div className={cn("flex gap-2 border-b border-border", className)}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            activeFilter === filter.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {filter.label}
          {activeFilter === filter.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
