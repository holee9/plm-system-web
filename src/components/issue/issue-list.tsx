"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueStatusBadge } from "./issue-status-badge";
import { IssuePriorityIcon } from "./issue-priority-icon";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import type { IssueStatus, IssuePriority, IssueType } from "~/modules/issue/types";

interface Issue {
  id: string;
  key: string;
  number: number;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId: string | null;
  assignee?: {
    name: string;
    email?: string;
    initials: string;
  } | null;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface IssueListProps {
  issues: Issue[];
  projectKey: string;
  isLoading?: boolean;
}

type SortField = "number" | "title" | "status" | "priority" | "updated" | "created";
type SortOrder = "asc" | "desc";

export function IssueList({ issues, projectKey, isLoading }: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.key.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    const matchesType = typeFilter === "all" || issue.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "number":
        comparison = a.number - b.number;
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "updated":
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "created":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get type badge color
  const getTypeColor = (type: IssueType) => {
    switch (type) {
      case "bug":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200";
      case "feature":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200";
      case "improvement":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200";
      case "task":
      default:
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IssueStatus | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="open">열림</SelectItem>
            <SelectItem value="in_progress">진행 중</SelectItem>
            <SelectItem value="review">검토 중</SelectItem>
            <SelectItem value="done">완료</SelectItem>
            <SelectItem value="closed">닫힘</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as IssuePriority | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 우선순위</SelectItem>
            <SelectItem value="urgent">긴급</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="medium">보통</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
            <SelectItem value="none">없음</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as IssueType | "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 유형</SelectItem>
            <SelectItem value="task">작업</SelectItem>
            <SelectItem value="bug">버그</SelectItem>
            <SelectItem value="feature">기능</SelectItem>
            <SelectItem value="improvement">개선</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("number")}
                >
                  ID
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("title")}
                >
                  제목
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("status")}
                >
                  상태
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("priority")}
                >
                  우선순위
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">유형</TableHead>
              <TableHead className="w-[200px]">담당자</TableHead>
              <TableHead className="w-[150px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort("updated")}
                >
                  업데이트
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : sortedIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  이슈가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              sortedIssues.map((issue) => (
                <TableRow key={issue.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${projectKey}/issues/${issue.number}`}
                      className="hover:underline"
                    >
                      {issue.key}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/projects/${projectKey}/issues/${issue.number}`}
                      className="hover:underline"
                    >
                      {issue.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <IssueStatusBadge status={issue.status} />
                  </TableCell>
                  <TableCell>
                    <IssuePriorityIcon priority={issue.priority} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(issue.type)}>
                      {issue.type === "task" && "작업"}
                      {issue.type === "bug" && "버그"}
                      {issue.type === "feature" && "기능"}
                      {issue.type === "improvement" && "개선"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {issue.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {issue.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{issue.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">미할당</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(issue.updatedAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Result count */}
      <div className="text-sm text-muted-foreground">
        {sortedIssues.length}개의 이슈
      </div>
    </div>
  );
}
