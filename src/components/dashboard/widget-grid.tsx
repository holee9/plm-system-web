"use client";

/**
 * Widget Grid Component
 * 12-column CSS Grid layout with @dnd-kit drag and drop support
 */
import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Widget } from "~/server/db";

interface WidgetGridProps {
  widgets: Widget[];
  onWidgetUpdate: (widgetId: string, updates: Partial<Widget>) => void;
  onWidgetRemove: (widgetId: string) => void;
  readOnly?: boolean;
  children?: React.ReactNode;
}

interface WidgetWrapperProps {
  widget: Widget;
  isDragging?: boolean;
  onUpdate: (updates: Partial<Widget>) => void;
  onRemove: () => void;
  readOnly?: boolean;
  children: React.ReactNode;
}

/**
 * Individual widget wrapper with drag handle and remove button
 */
function WidgetWrapper({
  widget,
  isDragging,
  onUpdate,
  onRemove,
  readOnly,
  children,
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: widget.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate grid position based on widget size
  const gridColumn = `span ${widget.size.w}`;
  const gridRow = `span ${widget.size.h}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isSortableDragging && "z-50"
      )}
      style={{
        ...style,
        gridColumn,
        gridRow,
      }}
    >
      <div className="h-full bg-card border border-border/60 rounded-lg shadow-sm overflow-hidden">
        {/* Widget Header */}
        {!readOnly && (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/60">
            <div
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        )}

        {/* Widget Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Widget Grid with drag and drop support
 */
export function WidgetGrid({
  widgets,
  onWidgetUpdate,
  onWidgetRemove,
  readOnly = false,
  children,
}: WidgetGridProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    if (over) {
      setOverId(over.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      // Reorder widgets array
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);

      // Update positions based on new order
      reorderedWidgets.forEach((widget, index) => {
        const newPosition = calculateGridPosition(index);
        if (
          widget.position.x !== newPosition.x ||
          widget.position.y !== newPosition.y
        ) {
          onWidgetUpdate(widget.id, { position: newPosition });
        }
      });
    }

    setActiveId(null);
    setOverId(null);
  };

  // Calculate grid position based on index (auto-layout)
  const calculateGridPosition = (index: number) => {
    const columns = 12;
    const widget = widgets[index];
    const width = widget.size.w;

    // Simple row-based layout
    let x = 0;
    let y = 0;

    for (let i = 0; i < index; i++) {
      const prevWidget = widgets[i];
      if (x + prevWidget.size.w > columns) {
        // Move to next row
        x = 0;
        y += Math.max(prevWidget.size.h, 2);
      }
      x += prevWidget.size.w;
    }

    return { x, y };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          {widgets.map((widget) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              isDragging={activeId === widget.id}
              onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
              onRemove={() => onWidgetRemove(widget.id)}
              readOnly={readOnly}
            >
              {children}
            </WidgetWrapper>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeWidget ? (
          <div className="w-64 h-32 bg-card border border-border/60 rounded-lg shadow-lg opacity-80">
            <div className="p-4">
              <div className="font-medium">{widgetTypes[activeWidget.type]}</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Widget type labels
const widgetTypes: Record<string, string> = {
  stat: "Statistics Card",
  chart: "Chart",
  list: "List",
  table: "Table",
  custom: "Custom Widget",
};
