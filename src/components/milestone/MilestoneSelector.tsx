"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MilestoneSelectorProps {
  projectId: string;
  value?: string | null;
  onChange: (milestoneId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  onCreateMilestone?: (title: string) => void;
}

export function MilestoneSelector({
  projectId,
  value,
  onChange,
  disabled = false,
  placeholder = "Select milestone...",
  allowCreate = false,
  onCreateMilestone,
}: MilestoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fetch milestones for this project
  const { data: milestonesData, isLoading } = trpc.project.listMilestones.useQuery(
    {
      projectId,
      status: "open", // Only show open milestones
      limit: 100,
    },
    { enabled: !!projectId }
  );

  const milestones = milestonesData?.milestones ?? [];

  // Get selected milestone
  const selectedMilestone = milestones.find((m) => m.id === value);

  // Group milestones by due date or status
  const overdueMilestones = milestones.filter(
    (m) => m.dueDate && new Date(m.dueDate) < new Date() && m.status === "open"
  );
  const upcomingMilestones = milestones.filter(
    (m) => !m.dueDate || new Date(m.dueDate) >= new Date() || m.status !== "open"
  );

  const handleSelect = (milestoneId: string | null) => {
    onChange(milestoneId);
    setOpen(false);
  };

  const handleCreateNew = () => {
    if (searchValue.trim() && onCreateMilestone) {
      onCreateMilestone(searchValue.trim());
      setSearchValue("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between"
        >
          {selectedMilestone ? (
            <span className="truncate">{selectedMilestone.title}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search milestones..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {allowCreate ? (
                <div className="py-2">
                  <p className="text-sm text-muted-foreground px-2">
                    No milestones found.
                  </p>
                  <button
                    className="w-full text-left px-2 py-1 text-sm text-primary hover:underline"
                    onClick={handleCreateNew}
                  >
                    Create "{searchValue}"
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No milestones found.</p>
              )}
            </CommandEmpty>

            {/* Clear selection option */}
            {value && (
              <CommandGroup>
                <CommandItem
                  value="clear"
                  onSelect={() => handleSelect(null)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-muted-foreground">Clear milestone</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Overdue milestones */}
            {overdueMilestones.length > 0 && (
              <CommandGroup heading="Overdue">
                {overdueMilestones.map((milestone) => (
                  <CommandItem
                    key={milestone.id}
                    value={milestone.id}
                    onSelect={() => handleSelect(milestone.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === milestone.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{milestone.title}</span>
                        {milestone.dueDate && (
                          <span className="text-xs text-red-500">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Upcoming milestones */}
            {upcomingMilestones.length > 0 && (
              <CommandGroup heading="Upcoming">
                {upcomingMilestones.map((milestone) => (
                  <CommandItem
                    key={milestone.id}
                    value={milestone.id}
                    onSelect={() => handleSelect(milestone.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === milestone.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{milestone.title}</span>
                        {milestone.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
