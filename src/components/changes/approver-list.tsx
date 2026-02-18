"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  Mail,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Approver status types
 */
export type ApproverStatus = "pending" | "approved" | "rejected";

/**
 * Approver interface
 */
export interface Approver {
  id: string;
  changeOrderId: string;
  userId: string;
  status: ApproverStatus;
  comment?: string;
  reviewedAt?: Date;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar?: string | null;
  };
}

/**
 * Approver list component props
 */
interface ApproverListProps {
  /** Change order ID */
  changeOrderId: string;
  /** Optional max height for scrollable area */
  maxHeight?: string;
  /** Optional className */
  className?: string;
  /** Whether to show actions (add/remove approvers) */
  showActions?: boolean;
  /** Whether to show detailed view */
  detailed?: boolean;
}

/**
 * Status configuration for display
 */
const statusConfig: Record<
  ApproverStatus,
  { label: string; icon: typeof Check; className: string; description: string }
> = {
  pending: {
    label: "대기 중",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    description: "검토 대기 중",
  },
  approved: {
    label: "승인됨",
    icon: Check,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    description: "승인 완료",
  },
  rejected: {
    label: "거부됨",
    icon: X,
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
    description: "거부됨",
  },
};

/**
 * ApproverList Component
 * @description Displays a list of approvers with their status
 */
export function ApproverList({
  changeOrderId,
  maxHeight = "300px",
  className,
  showActions = false,
  detailed = false,
}: ApproverListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const utils = trpc.useUtils();

  // Fetch change order details
  const { data: changeOrder, isLoading } = trpc.plm.changeOrder.getById.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  // Fetch project members for adding approvers
  const { data: memberData = [] } = trpc.project.listMembers.useQuery(
    { projectId: changeOrder?.projectId ?? "" },
    { enabled: showActions && !!changeOrder?.projectId }
  );

  // Add approver mutation
  const addApproverMutation = trpc.plm.changeOrder.addApprover.useMutation({
    onSuccess: () => {
      toast.success("승인자가 추가되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "승인자 추가 실패");
    },
  });

  // Remove approver mutation
  const removeApproverMutation = trpc.plm.changeOrder.removeApprover.useMutation({
    onSuccess: () => {
      toast.success("승인자가 제거되었습니다");
      utils.plm.changeOrder.getById.invalidate({ changeOrderId });
    },
    onError: (error: any) => {
      toast.error(error.message || "승인자 제거 실패");
    },
  });

  const approvers = changeOrder?.approvers as Approver[] | undefined;
  const canModify = changeOrder?.status === "draft";

  const handleAddApprover = (userId: string) => {
    addApproverMutation.mutate({
      changeOrderId,
      userId,
    });
  };

  const handleRemoveApprover = (approverId: string) => {
    removeApproverMutation.mutate({
      changeOrderId,
      approverId,
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">승인자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            승인자 목록
          </div>
          <div className="flex items-center gap-2">
            {approvers && approvers.length > 0 && (
              <Badge variant="secondary">{approvers.length}명</Badge>
            )}
            {showActions && canModify && (
              <AddApproverDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                members={memberData}
                existingApproverIds={approvers?.map((a) => a.userId) ?? []}
                onAddApprover={handleAddApprover}
                isPending={addApproverMutation.isPending}
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="p-4">
            {!approvers || approvers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  승인자가 없습니다
                </p>
                {showActions && canModify && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    승인자 추가
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {approvers.map((approver, index) => (
                  <React.Fragment key={approver.id}>
                    <ApproverListItem
                      approver={approver}
                      detailed={detailed}
                      showActions={showActions && canModify}
                      onRemove={() => handleRemoveApprover(approver.id)}
                      isRemoving={removeApproverMutation.isPending}
                    />
                    {index < approvers.length - 1 && <Separator className="my-2" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Individual approver list item
 */
interface ApproverListItemProps {
  approver: Approver;
  detailed?: boolean;
  showActions?: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
}

function ApproverListItem({
  approver,
  detailed = false,
  showActions = false,
  onRemove,
  isRemoving = false,
}: ApproverListItemProps) {
  const config = statusConfig[approver.status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        {approver.user?.avatar ? (
          <img src={approver.user.avatar} alt={approver.user.name || ""} />
        ) : (
          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
            {approver.user?.name?.[0] || approver.user?.email?.[0] || "?"}
          </div>
        )}
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium">
            {approver.user?.name || "알 수 없음"}
          </p>
          <Badge variant="outline" className={cn("text-xs", config.className)}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Detailed view */}
        {detailed && (
          <>
            {approver.user?.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <Mail className="h-3 w-3" />
                <span className="truncate">{approver.user.email}</span>
              </div>
            )}
            {approver.comment && (
              <p className="text-sm text-muted-foreground mt-1">
                &quot;{approver.comment}&quot;
              </p>
            )}
            {approver.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                검토일: {new Date(approver.reviewedAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {showActions && approver.status === "pending" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onRemove}
              disabled={isRemoving}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              승인자 제거
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * Add approver dialog
 */
interface AddApproverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  existingApproverIds: string[];
  onAddApprover: (userId: string) => void;
  isPending: boolean;
}

function AddApproverDialog({
  open,
  onOpenChange,
  members,
  existingApproverIds,
  onAddApprover,
  isPending,
}: AddApproverDialogProps) {
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

  const availableMembers = members.filter(
    (m) => !existingApproverIds.includes(m.userId)
  );

  const handleAdd = () => {
    if (selectedUserId) {
      onAddApprover(selectedUserId);
      setSelectedUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!open}>
          <UserPlus className="h-4 w-4 mr-2" />
          승인자 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>승인자 추가</DialogTitle>
          <DialogDescription>
            승인자로 지정할 프로젝트 멤버를 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {availableMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              추가 가능한 멤버가 없습니다
            </p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {availableMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedUserId(member.userId)}
                >
                  <Checkbox
                    checked={selectedUserId === member.userId}
                    onChange={() => setSelectedUserId(member.userId)}
                  />
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.user?.name?.[0] || member.user?.email?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {member.user?.name || "알 수 없음"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedUserId(null);
            }}
            disabled={isPending}
          >
            취소
          </Button>
          <Button onClick={handleAdd} disabled={!selectedUserId || isPending}>
            {isPending ? "추가 중..." : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact inline version of approver list
 */
export interface ApproverListInlineProps {
  approvers: Approver[];
  className?: string;
}

export function ApproverListInline({ approvers, className }: ApproverListInlineProps) {
  if (!approvers || approvers.length === 0) {
    return <span className="text-sm text-muted-foreground">승인자 없음</span>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {approvers.map((approver) => {
        const config = statusConfig[approver.status];
        return (
          <Badge
            key={approver.id}
            variant="outline"
            className={cn("text-xs", config.className)}
          >
            {approver.user?.name || "알 수 없음"}
          </Badge>
        );
      })}
    </div>
  );
}
