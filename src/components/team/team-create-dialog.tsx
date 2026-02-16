"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/lib/trpc";

const createTeamSchema = z.object({
  name: z.string().min(2, "팀 이름은 최소 2자 이상이어야 합니다").max(100),
  description: z.string().optional(),
});

type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

interface TeamCreateDialogProps {
  onCreateSuccess?: () => void;
}

export function TeamCreateDialog({ onCreateSuccess }: TeamCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { refetch: refetchTeams } = trpc.team.list.useQuery();

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createTeamMutation = trpc.team.create.useMutation({
    onSuccess: (data) => {
      toast({ title: "팀이 생성되었습니다", variant: "default" });
      form.reset();
      setOpen(false);
      setIsLoading(false);
      // Refetch teams list
      refetchTeams();
      onCreateSuccess?.();
    },
    onError: (error) => {
      toast({ title: error.message || "팀 생성에 실패했습니다", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: CreateTeamFormValues) => {
    setIsLoading(true);
    try {
      await createTeamMutation.mutateAsync(values);
    } catch {
      // Error handled in mutation callback
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 팀 만들기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>
            팀을 생성하여 동료들과 협업하세요
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>팀 이름</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="마케팅 팀"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="팀에 대한 간단한 설명"
                      disabled={isLoading}
                      {...field}
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
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                팀 만들기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
