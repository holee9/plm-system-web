"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const inviteMemberSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  role: z.enum(["admin", "member"], {
    required_error: "역할을 선택해주세요",
  }),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  teamId: string;
  onInviteSuccess?: () => void;
}

export function InviteMemberDialog({ teamId, onInviteSuccess }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { refetch: refetchTeamDetails } = trpc.team.getById.useQuery({ teamId });

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const addMemberMutation = trpc.team.addMember.useMutation({
    onSuccess: (data) => {
      toast({ title: data.message, variant: "default" });
      form.reset();
      setOpen(false);
      setIsLoading(false);
      // Refetch team details to refresh member list
      refetchTeamDetails();
      onInviteSuccess?.();
    },
    onError: (error) => {
      toast({ title: error.message || "멤버 추가에 실패했습니다", variant: "destructive" });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    setIsLoading(true);
    try {
      await addMemberMutation.mutateAsync({
        teamId,
        email: values.email,
        role: values.role,
      });
    } catch {
      // Error handled in mutation callback
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          멤버 초대
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>팀 멤버 초대</DialogTitle>
          <DialogDescription>
            이메일로 팀에 새 멤버를 추가하세요
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="colleague@company.com"
                      type="email"
                      autoComplete="email"
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>역할</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="역할 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">멤버</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
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
                초대
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
