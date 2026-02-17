"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangeOrderList } from "@/components/changes/change-order-list";
import type { ChangeOrderType, ChangeOrderStatus } from "@/components/changes/change-order-list";

interface ChangeOrderListClientProps {
  projectId: string;
  projectKey: string;
}

export function ChangeOrderListClient({ projectId, projectKey }: ChangeOrderListClientProps) {
  return (
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
        />
      </TabsContent>

      <TabsContent value="ecr" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          typeFilter="ECR"
        />
      </TabsContent>

      <TabsContent value="ecn" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          typeFilter="ECN"
        />
      </TabsContent>

      <TabsContent value="draft" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="draft"
        />
      </TabsContent>

      <TabsContent value="in_review" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="in_review"
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        <ChangeOrderList
          projectId={projectId}
          projectKey={projectKey}
          statusFilter="approved"
        />
      </TabsContent>
    </Tabs>
  );
}
