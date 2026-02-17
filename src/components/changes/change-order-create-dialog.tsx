"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileText, Users, AlertTriangle } from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AffectedPartSelector } from "./affected-part-selector";
import { cn } from "@/lib/utils";

const changeOrderSchema = z.object({
  type: z.enum(["ECR", "ECN"]),
  title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다").max(500),
  description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다"),
  reason: z.string().min(1, "변경 사유를 입력해야 합니다"),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  approverIds: z.array(z.string().uuid()).min(1, "최소 1명 이상의 승인자를 지정해야 합니다"),
});

type ChangeOrderFormValues = z.infer<typeof changeOrderSchema>;

interface ChangeOrderCreateDialogProps {
  projectId: string;
  projectKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const priorityConfig = {
  urgent: { label: "긴급", className: "text-rose-600 bg-rose-50 border-rose-200" },
  high: { label: "높음", className: "text-orange-600 bg-orange-50 border-orange-200" },
  medium: { label: "중간", className: "text-amber-600 bg-amber-50 border-amber-200" },
  low: { label: "낮음", className: "text-blue-600 bg-blue-50 border-blue-200" },
};

export function ChangeOrderCreateDialog({
  projectId,
  projectKey,
  open,
  onOpenChange,
  onSuccess,
}: ChangeOrderCreateDialogProps) {
  const utils = trpc.useUtils();

  // State for affected parts
  const [affectedPartIds, setAffectedPartIds] = React.useState<string[]>([]);

  // Fetch project members for approvers
  const { data: memberData = [] } = trpc.project.listMembers.useQuery(
    { projectId },
    { enabled: open && !!projectId }
  );

  const form = useForm<ChangeOrderFormValues>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: {
      type: "ECR",
      title: "",
      description: "",
      reason: "",
      priority: "medium",
      approverIds: [],
    },
  });

  const createMutation = trpc.plm.changeOrder.create.useMutation({
    onSuccess: () => {
      toast.success("변경 주문이 생성되었습니다");
      utils.plm.changeOrder.list.invalidate({ projectId });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "변경 주문 생성 실패");
    },
  });

  const onSubmit = async (values: ChangeOrderFormValues) => {
    createMutation.mutate({
      projectId,
      ...values,
      affectedPartIds, // Include affected parts
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            새 변경 주문 생성
          </DialogTitle>
          <DialogDescription>
            ECR(변경 요청) 또는 ECN(변경 통지)를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>변경 주문 유형</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ECR">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">ECR</Badge>
                          <span>Engineering Change Request (변경 요청)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ECN">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">ECN</Badge>
                          <span>Engineering Change Notice (변경 통지)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    ECR: 변경 제안, ECN: 승인된 변경 공지
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="변경 내용을 요약해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="변경에 대한 상세 설명을 입력해주세요"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    변경의 목적, 범위, 영향도 등을 상세히 설명해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>변경 사유</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="이 변경이 필요한 이유를 설명해주세요"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="우선순위 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Affected Parts */}
            <div className="space-y-2">
              <label className="text-sm font-medium">영향받는 부품</label>
              <AffectedPartSelector
                projectId={projectId}
                value={affectedPartIds}
                onChange={setAffectedPartIds}
                compact={false}
              />
              <p className="text-xs text-muted-foreground">
                이 변경으로 영향받는 부품을 선택하세요 (선택 사항)
              </p>
            </div>

            {/* Approvers */}
            <FormField
              control={form.control}
              name="approverIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>승인자</FormLabel>
                  <FormDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    최소 1명 이상 지정 (병렬 승인)
                  </FormDescription>
                  <div className="space-y-2">
                    {memberData.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        프로젝트 멤버가 없습니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {memberData.map((member: any) => (
                          <div key={member.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`approver-${member.id}`}
                              checked={field.value.includes(member.userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, member.userId]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== member.userId));
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`approver-${member.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {member.user?.name || member.user?.email || "알 수 없음"}
                              <span className="text-muted-foreground ml-2">
                                ({member.role})
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
