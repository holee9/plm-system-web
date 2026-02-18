"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ChangeOrderList } from "@/components/changes/change-order-list";
import type { ChangeOrderType, ChangeOrderStatus } from "@/components/changes/change-order-list";

interface ChangeOrderListClientProps {
  projectId: string;
  projectKey: string;
}

export function ChangeOrderListClient({ projectId, projectKey }: ChangeOrderListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="변경 주문 검색 (제목, 번호)..."

          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="ecr">ECR (변경 요청)</TabsTrigger>
          <TabsTrigger value="ecn">ECN (변경 통지)</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="in_review">검토 중</TabsTrigger>
          <TabsTrigger value="approved">승인됨</TabsTrigger>
        </TabsList>

      <TabsContent value="all" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="all"
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="ecr" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          typeFilter="ECR"
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="ecn" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          typeFilter="ECN"
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="draft" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="draft"
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="in_review" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="in_review"
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="approved"
          searchQuery={searchQuery}
        />
      </TabsContent>
    </Tabs>
  );
}
