"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Users, Settings, MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { trpc as api } from "@/lib/trpc";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamCreateDialog } from "@/components/team/team-create-dialog";
import type { TeamWithRole, TeamRole } from "@/modules/identity/types";
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

export default function TeamsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: teamsData, isLoading: isLoadingTeams } = api.team.list.useQuery();
  const { data: currentUser } = api.user.me.useQuery();

  const teams = teamsData?.teams || [];

  const handleTeamClick = (teamId: string) => {
    router.push(`/settings/teams/${teamId}`);
  };

  if (isLoadingTeams) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">팀</h1>
          <p className="text-muted-foreground">팀을 관리하세요</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">팀</h1>
          <p className="text-muted-foreground">
            {teams.length > 0 && `${teams.length}개의 팀`}
          </p>
        </div>
        <TeamCreateDialog
          onCreateSuccess={() => {
            setIsCreateDialogOpen(false);
          }}
        />
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>팀이 없습니다</CardTitle>
            <CardDescription>
              새 팀을 만들어 동료들과 협업을 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <TeamCreateDialog
              onCreateSuccess={() => {
                setIsCreateDialogOpen(false);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleTeamClick(team.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    {team.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {team.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>팀 관리</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/settings/teams/${team.id}`); }}>
                        <Settings className="mr-2 h-4 w-4" />
                        팀 설정
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>멤버 {team.memberCount}명</span>
                  </div>
                  <Badge variant={roleVariants[team.role as TeamRole]}>{roleLabels[team.role as TeamRole]}</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  생성됨 {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
