"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const bomItemSchema = z.object({
  childPartId: z.string().min(1, "Child part is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().default("ea"),
  position: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

type BomItemFormValues = z.infer<typeof bomItemSchema>;

interface BomAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentPartId: string;
  projectId: string;
  onSuccess?: () => void;
}

export function BomAddItemDialog({
  open,
  onOpenChange,
  parentPartId,
  projectId,
  onSuccess,
}: BomAddItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();

  // Fetch available parts (excluding current part to prevent cycles)
  const { data: availableParts } = trpc.plm.part.list.useQuery({
    projectId,
    limit: 1000,
  });

  // Filter out the parent part itself
  const parts = availableParts?.parts.filter((p: { id: string }) => p.id !== parentPartId) || [];

  const form = useForm({
    resolver: zodResolver(bomItemSchema),
    defaultValues: {
      childPartId: "",
      quantity: "1",
      unit: "ea",
      position: undefined,
      notes: "",
    },
  });

  const addBomItemMutation = trpc.plm.bom.addItem.useMutation({
    onSuccess: () => {
      toast.success("BOM item added successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error((error as Error)?.message || "Failed to add BOM item");
    },
  });

  const onSubmit = async (values: z.infer<typeof bomItemSchema>) => {
    setIsSubmitting(true);
    try {
      await addBomItemMutation.mutateAsync({
        parentPartId,
        childPartId: values.childPartId,
        quantity: values.quantity,
        unit: values.unit,
        position: values.position,
        notes: values.notes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-width-[500px]">
        <DialogHeader>
          <DialogTitle>Add BOM Item</DialogTitle>
          <DialogDescription>
            Add a child part to the Bill of Materials
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="childPartId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child Part</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a part" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parts.map((part: { id: string; partNumber: string; name: string }) => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.partNumber} - {part.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ea">Each (ea)</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="m">Meter (m)</SelectItem>
                        <SelectItem value="cm">Centimeter (cm)</SelectItem>
                        <SelectItem value="mm">Millimeter (mm)</SelectItem>
                        <SelectItem value="l">Liter (l)</SelectItem>
                        <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Order in BOM"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional information about this BOM item"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
