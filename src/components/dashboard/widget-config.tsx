"use client";

/**
 * Widget Configuration Dialog
 * Add and configure widgets for custom dashboards
 */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

const widgetConfigSchema = z.object({
  type: z.enum(["stat", "chart", "list", "table", "custom"]),
  title: z.string().min(1, "Title is required"),
  size: z.object({
    w: z.number().min(1).max(12),
    h: z.number().min(1).max(12),
  }),
  config: z.record(z.any()),
});

type WidgetConfigValues = z.infer<typeof widgetConfigSchema>;

interface WidgetConfigDialogProps {
  onAdd: (widget: {
    type: "stat" | "chart" | "list" | "table" | "custom";
    position: { x: number; y: number };
    size: { w: number; h: number };
    config: Record<string, any>;
  }) => void;
  trigger?: React.ReactNode;
}

const widgetTypeOptions = [
  { value: "stat", label: "Statistics Card", description: "Display key metrics" },
  { value: "chart", label: "Chart", description: "Visual data representation" },
  { value: "list", label: "List", description: "Recent items list" },
  { value: "table", label: "Table", description: "Data grid view" },
  { value: "custom", label: "Custom", description: "Custom widget" },
];

const sizePresets = [
  { label: "Small (3x2)", w: 3, h: 2 },
  { label: "Medium (6x3)", w: 6, h: 3 },
  { label: "Large (12x4)", w: 12, h: 4 },
  { label: "Full Width (12x6)", w: 12, h: 6 },
];

export function WidgetConfigDialog({ onAdd, trigger }: WidgetConfigDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<"stat" | "chart" | "list" | "table" | "custom">("stat");

  const form = useForm<WidgetConfigValues>({
    resolver: zodResolver(widgetConfigSchema),
    defaultValues: {
      type: "stat",
      title: "",
      size: { w: 3, h: 2 },
      config: {},
    },
  });

  const handleSubmit = (values: WidgetConfigValues) => {
    const widget = {
      type: values.type,
      position: { x: 0, y: 0 }, // Will be auto-calculated
      size: values.size,
      config: {
        ...values.config,
        title: values.title,
      },
    };

    onAdd(widget);
    form.reset();
    setOpen(false);
  };

  const handleTypeChange = (type: "stat" | "chart" | "list" | "table" | "custom") => {
    setSelectedType(type);
    form.setValue("type", type);

    // Set default config based on type
    switch (type) {
      case "stat":
        form.setValue("config", { title: "", metric: "totalIssues" });
        break;
      case "chart":
        form.setValue("config", { title: "", chartType: "bar" });
        break;
      case "list":
        form.setValue("config", { title: "", itemType: "issues", limit: 5 });
        break;
      case "table":
        form.setValue("config", { title: "", columns: [] });
        break;
      case "custom":
        form.setValue("config", { title: "" });
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Configure a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Widget Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => handleTypeChange(value as any)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select widget type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {widgetTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="config.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Widget title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size Presets */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {sizePresets.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant={field.value.w === preset.w && field.value.h === preset.h ? "default" : "outline"}
                        onClick={() => field.setValue("size", { w: preset.w, h: preset.h })}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type-specific config */}
            {selectedType === "stat" && (
              <FormField
                control={form.control}
                name="config.metric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="totalIssues">Total Issues</SelectItem>
                        <SelectItem value="openIssues">Open Issues</SelectItem>
                        <SelectItem value="completedIssues">Completed Issues</SelectItem>
                        <SelectItem value="totalParts">Total Parts</SelectItem>
                        <SelectItem value="totalChangeOrders">Total Change Orders</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "chart" && (
              <FormField
                control={form.control}
                name="config.chartType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chart Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "list" && (
              <FormField
                control={form.control}
                name="config.itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select list type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="issues">Recent Issues</SelectItem>
                        <SelectItem value="changeOrders">Recent Change Orders</SelectItem>
                        <SelectItem value="milestones">Upcoming Milestones</SelectItem>
                        <SelectItem value="activities">Recent Activities</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Widget</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
