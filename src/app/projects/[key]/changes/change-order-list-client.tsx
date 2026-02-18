"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeOrderList } from "@/components/changes/change-order-list";
import type { ChangeOrderType, ChangeOrderStatus } from "@/components/changes/change-order-list";

interface ChangeOrderListClientProps {
  projectId: string;
  projectKey: string;
}

type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";

export function ChangeOrderListClient({ projectId, projectKey }: ChangeOrderListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>("all");
  const [showFilters, setShowFilters] = React.useState(false);

  // Sync filters with tab changes
  const handleTabChange = (value: string) => {
    // Priority filter remains independent
  };

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="변경 주문 검색 (제목, 번호, 설명)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-accent" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-card">
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground">우선순위</label>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="urgent">긴급</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">중간</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="ecr">ECR</TabsTrigger>
          <TabsTrigger value="ecn">ECN</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="submitted">제출됨</TabsTrigger>
          <TabsTrigger value="in_review">검토 중</TabsTrigger>
          <TabsTrigger value="approved">승인됨</TabsTrigger>
          <TabsTrigger value="rejected">거부됨</TabsTrigger>
          <TabsTrigger value="implemented">구현됨</TabsTrigger>
        </TabsList>

      <TabsContent value="all" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="ecr" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="ECR"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="ecn" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          typeFilter="ECN"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="draft" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="draft"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="submitted" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="submitted"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="in_review" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="in_review"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="approved"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="rejected" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="rejected"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="implemented" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="implemented"
          typeFilter="all"
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
        />
      </TabsContent>
    </Tabs>
    </div>
  );
}
