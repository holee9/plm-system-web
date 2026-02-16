"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MoreHorizontal, Shield, ShieldAlert, User, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TeamMember, TeamRole } from "@/modules/identity/types";
import { trpc } from "@/lib/trpc";

interface TeamMemberListProps {
  teamId: string;
  members: TeamMember[];
  yourRole: TeamRole;
  currentUserId: string;
  onMemberRemoved?: () => void;
  onRoleUpdated?: () => void;
}

const roleLabels: Record<TeamRole, string> = {
  owner: "소유자",
  admin: "관리자",
  member: "멤버",
};

const roleVariants: Record<TeamRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TeamMemberList({
  teamId,
  members,
  yourRole,
  currentUserId,
  onMemberRemoved,
  onRoleUpdated,
}: TeamMemberListProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const removeMemberMutation = trpc.team.removeMember.useMutation();
  const updateRoleMutation = trpc.team.updateMemberRole.useMutation();

  const canManageMembers = yourRole === "owner" || yourRole === "admin";
  const canChangeRoles = yourRole === "owner";

  const handleRemoveMember = async (member: TeamMember) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    setIsRemoving(true);
    try {
      await removeMemberMutation.mutateAsync({
        teamId,
        userId: selectedMember.userId,
      });
      toast({ title: "멤버가 제거되었습니다", variant: "default" });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
      setIsRemoving(false);
      onMemberRemoved?.();
    } catch (error) {
      const err = error as { message?: string };
      toast({ title: err.message || "멤버 제거에 실패했습니다", variant: "destructive" });
      setIsRemoving(false);
    }
  };

  const handleChangeRole = async (member: TeamMember, newRole: "admin" | "member") => {
    if (member.role === newRole) return;

    setIsUpdatingRole(true);
    try {
      await updateRoleMutation.mutateAsync({
        teamId,
        userId: member.userId,
        role: newRole,
      });
      toast({ title: "역할이 변경되었습니다", variant: "default" });
      setIsUpdatingRole(false);
      onRoleUpdated?.();
    } catch (error) {
      const err = error as { message?: string };
      toast({ title: err.message || "역할 변경에 실패했습니다", variant: "destructive" });
      setIsUpdatingRole(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>멤버</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
            {(canManageMembers || canChangeRoles) && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.userImage || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.userName}</p>
                    <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={roleVariants[member.role]}>
                  {roleLabels[member.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                </span>
              </TableCell>
              {(canManageMembers || canChangeRoles) && (
                <TableCell>
                  {/* Only owner can manage roles, only owner/admin can remove members */}
                  {(canManageMembers || canChangeRoles) && member.userId !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isRemoving || isUpdatingRole}>
                          {isRemoving || isUpdatingRole ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>멤버 관리</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {canChangeRoles && member.role !== "owner" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member, "admin")}
                              disabled={isUpdatingRole}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              관리자로 변경
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member, "member")}
                              disabled={isUpdatingRole}
                            >
                              <User className="mr-2 h-4 w-4" />
                              멤버로 변경
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {canManageMembers && member.role !== "owner" && (
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member)}
                            className="text-destructive"
                            disabled={isRemoving}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            팀에서 제거
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버를 팀에서 제거하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedMember?.userName}</strong>님을 팀에서 제거합니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              제거
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
