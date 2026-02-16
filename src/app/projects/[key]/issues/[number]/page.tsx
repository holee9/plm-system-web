import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, User, Tag, AlertTriangle } from "lucide-react";
import { IssueStatusBadge } from "@/components/issue/issue-status-badge";
import { IssuePriorityIcon } from "@/components/issue/issue-priority-icon";
import { CommentList } from "@/components/issue/comment-list";
import { CommentForm } from "@/components/issue/comment-form";
import { getIssueByProjectKeyNumber, listIssueComments } from "~/modules/issue/service";
import Link from "next/link";

type IssueDetailPageProps = {
  params: Promise<{ key: string; number: string }>;
};

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { key, number } = await params;

  // Fetch issue using server-side service
  const issue = await getIssueByProjectKeyNumber(key, parseInt(number, 10));

  if (!issue) {
    notFound();
  }

  // Fetch comments using server-side service
  const comments = await listIssueComments(issue.id);

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${key}/issues`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-2xl font-bold">{issue.key}</h1>
          <Badge variant="secondary">#{issue.number}</Badge>
          <IssueStatusBadge status={issue.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">{issue.title}</h2>

              {issue.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {issue.description}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">설명 없음</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">댓글 ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CommentList comments={comments} />
              <Separator />
              <CommentForm
                onSubmit={async (content) => {
                  "use server";
                  const { createIssueComment } = await import("~/modules/issue/service");
                  const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
                  await createIssueComment(issue.id, content, TEST_USER_ID);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">세부사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">상태</span>
                <IssueStatusBadge status={issue.status} />
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">우선순위</span>
                <IssuePriorityIcon priority={issue.priority} />
              </div>

              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">유형</span>
                <Badge variant="outline">
                  {issue.type === "task" && "작업"}
                  {issue.type === "bug" && "버그"}
                  {issue.type === "feature" && "기능"}
                  {issue.type === "improvement" && "개선"}
                </Badge>
              </div>

              <Separator />

              {/* Assignee */}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">담당자</p>
                  {issue.assigneeId ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">AU</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">할당된 사용자</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">미할당</p>
                  )}
                </div>
              </div>

              {/* Reporter */}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">보고자</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">RU</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">보고자</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">생성일</p>
                  <p className="text-sm mt-1">
                    {new Date(issue.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">업데이트</p>
                  <p className="text-sm mt-1">
                    {new Date(issue.updatedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                상태 변경
              </Button>
              <Button variant="outline" className="w-full justify-start">
                담당자 변경
              </Button>
              <Button variant="outline" className="w-full justify-start">
                라벨 추가
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                이슈 삭제
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
