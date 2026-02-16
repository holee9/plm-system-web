"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ArrowLeft, Settings, Users, User as UserIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { TeamMemberList } from "@/components/team/team-member-list";
import type { TeamMember, TeamRole } from "@/modules/identity/types";
import { trpc } from "@/lib/trpc";

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

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = Number(params.id);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: currentUser } = trpc.user.me.useQuery();
  const { data: teamDetails, isLoading: isLoadingTeam, refetch: refetchTeam } = trpc.team.getById.useQuery(
    { teamId },
    { enabled: !isNaN(teamId) }
  );

  const updateTeamMutation = trpc.team.update.useMutation({
    onSuccess: (data) => {
      toast({ title: data.message, variant: "default" });
      setIsEditing(false);
      setIsEditDialogOpen(false);
      refetchTeam();
    },
    onError: (error) => {
      toast({ title: error.message || "팀 업데이트에 실패했습니다", variant: "destructive" });
      setIsEditing(false);
    },
  });

  const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    setIsEditing(true);
    try {
      await updateTeamMutation.mutateAsync({
        teamId,
        name: name || undefined,
        description: description || undefined,
      });
    } catch {
      // Error handled in mutation callback
    }
  };

  if (isLoadingTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings/teams")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">팀을 찾을 수 없습니다</h1>
        </div>
      </div>
    );
  }

  const canEditTeam = teamDetails.yourRole === "owner" || teamDetails.yourRole === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings/teams")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{teamDetails.name}</h1>
            <p className="text-muted-foreground">
              멤버 {teamDetails.memberCount}명 • 생성됨{" "}
              {formatDistanceToNow(new Date(teamDetails.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {canEditTeam && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                팀 설정
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>팀 정보 수정</DialogTitle>
                <DialogDescription>팀의 이름과 설명을 수정하세요</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    팀 이름
                  </label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={teamDetails.name}
                    placeholder="팀 이름"
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-description" className="text-sm font-medium">
                    설명
                  </label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={teamDetails.description || ""}
                    placeholder="팀에 대한 설명"
                    disabled={isEditing}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isEditing}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isEditing}>
                    {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    저장
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">내 역할:</span>
        <Badge variant={roleVariants[teamDetails.yourRole]}>{roleLabels[teamDetails.yourRole]}</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            멤버
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>팀 멤버</CardTitle>
                  <CardDescription>
                    팀에 속한 모든 멤버를 관리하세요
                  </CardDescription>
                </div>
                {canEditTeam && (
                  <InviteMemberDialog
                    teamId={teamId}
                    onInviteSuccess={() => refetchTeam()}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <TeamMemberList
                teamId={teamId}
                members={teamDetails.members as TeamMember[]}
                yourRole={teamDetails.yourRole}
                currentUserId={currentUser?.id || 0}
                onMemberRemoved={() => refetchTeam()}
                onRoleUpdated={() => refetchTeam()}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
