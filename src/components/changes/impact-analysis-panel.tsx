"use client";

import * as React from "react";
import {
  Package,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  FileText,
  Boxes,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * Impact level types
 */
export type ImpactLevel = "none" | "low" | "medium" | "high" | "critical";

/**
 * Affected part interface
 */
export interface AffectedPart {
  id: string;
  partId: string;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  status: string;
  version?: string;
  revision?: string;
  impactLevel?: ImpactLevel;
  impactDescription?: string;
  affectedAssemblies?: AffectedAssembly[];
  affectedDocuments?: AffectedDocument[];
}

/**
 * Affected assembly interface
 */
export interface AffectedAssembly {
  id: string;
  assemblyNumber: string;
  assemblyName: string;
  quantity: number;
}

/**
 * Affected document interface
 */
export interface AffectedDocument {
  id: string;
  documentNumber: string;
  title: string;
  type: string;
}

/**
 * Impact analysis panel component props
 */
interface ImpactAnalysisPanelProps {
  /** Change order ID */
  changeOrderId: string;
  /** Optional max height for scrollable area */
  maxHeight?: string;
  /** Optional className */
  className?: string;
  /** Whether to show detailed view */
  detailed?: boolean;
  /** Whether to allow expanding sections */
  collapsible?: boolean;
}

/**
 * Impact level configuration
 */
const impactLevelConfig: Record<
  ImpactLevel,
  { label: string; icon: typeof Info; className: string; description: string }
> = {
  none: {
    label: "영향 없음",
    icon: CheckCircle2,
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    description: "이 변경으로 인한 영향이 없습니다",
  },
  low: {
    label: "낮음",
    icon: Info,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "최소한의 영향이 예상됩니다",
  },
  medium: {
    label: "중간",
    icon: AlertCircle,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    description: "중간 수준의 영향이 예상됩니다",
  },
  high: {
    label: "높음",
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    description: "상당한 영향이 예상됩니다",
  },
  critical: {
    label: "치명적",
    icon: XCircle,
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    description: "매우 큰 영향이 예상됩니다",
  },
};

/**
 * ImpactAnalysisPanel Component
 * @description Panel displaying impact analysis for change order
 */
export function ImpactAnalysisPanel({
  changeOrderId,
  maxHeight = "400px",
  className,
  detailed = true,
  collapsible = true,
}: ImpactAnalysisPanelProps) {
  const [expandedParts, setExpandedParts] = React.useState<Set<string>>(new Set());

  // Fetch impact analysis
  const { data: impactData, isLoading } = trpc.plm.changeOrder.impactAnalysis.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  // ImpactAnalysisResult contains affectedParts array
  const affectedParts = (impactData?.affectedParts as AffectedPart[]) || [];

  // Calculate impact summary
  const impactSummary = React.useMemo(() => {
    const summary = {
      none: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      totalAssemblies: 0,
      totalDocuments: 0,
    };

    affectedParts.forEach((part) => {
      const level = part.impactLevel || "none";
      summary[level as keyof typeof summary]++;
      summary.totalAssemblies += part.affectedAssemblies?.length || 0;
      summary.totalDocuments += part.affectedDocuments?.length || 0;
    });

    return summary;
  }, [affectedParts]);

  const togglePartExpanded = (partId: string) => {
    setExpandedParts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partId)) {
        newSet.delete(partId);
      } else {
        newSet.add(partId);
      }
      return newSet;
    });
  };

  const getHighestImpactLevel = (): ImpactLevel => {
    if (impactSummary.critical > 0) return "critical";
    if (impactSummary.high > 0) return "high";
    if (impactSummary.medium > 0) return "medium";
    if (impactSummary.low > 0) return "low";
    return "none";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">영향도 분석</CardTitle>
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          영향도 분석
          {affectedParts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {affectedParts.length}개 부품
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Impact Summary */}
        {affectedParts.length > 0 && (
          <ImpactSummaryCard
            summary={impactSummary}
            highestImpact={getHighestImpactLevel()}
          />
        )}

        {/* Affected Parts List */}
        {affectedParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              영향받는 부품이 없습니다
            </p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {affectedParts.map((part) => (
                <AffectedPartCard
                  key={part.id}
                  part={part}
                  detailed={detailed}
                  collapsible={collapsible}
                  isExpanded={expandedParts.has(part.id)}
                  onToggleExpand={() => togglePartExpanded(part.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Statistics */}
        {affectedParts.length > 0 && (impactSummary.totalAssemblies > 0 || impactSummary.totalDocuments > 0) && (
          <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
            {impactSummary.totalAssemblies > 0 && (
              <div className="flex items-center gap-1">
                <Boxes className="h-4 w-4" />
                <span>{impactSummary.totalAssemblies}개 관련 조립품</span>
              </div>
            )}
            {impactSummary.totalDocuments > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{impactSummary.totalDocuments}개 관련 문서</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Impact summary card component
 */
interface ImpactSummaryCardProps {
  summary: {
    none: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
    totalAssemblies: number;
    totalDocuments: number;
  };
  highestImpact: ImpactLevel;
}

function ImpactSummaryCard({ summary, highestImpact }: ImpactSummaryCardProps) {
  const config = impactLevelConfig[highestImpact];
  const Icon = config.icon;

  const totalParts = summary.none + summary.low + summary.medium + summary.high + summary.critical;
  const affectedCount = totalParts - summary.none;

  return (
    <div className={cn("p-4 rounded-lg border", config.className, "bg-opacity-20")}>
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8" />
        <div className="flex-1">
          <p className="font-medium">{config.label} 영향도</p>
          <p className="text-sm opacity-80">{config.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{affectedCount}</p>
          <p className="text-xs opacity-80">/ {totalParts}개 부품</p>
        </div>
      </div>

      {/* Impact breakdown */}
      <div className="flex flex-wrap gap-2 mt-3">
        {summary.low > 0 && (
          <Badge variant="outline" className={impactLevelConfig.low.className}>
            낮음: {summary.low}
          </Badge>
        )}
        {summary.medium > 0 && (
          <Badge variant="outline" className={impactLevelConfig.medium.className}>
            중간: {summary.medium}
          </Badge>
        )}
        {summary.high > 0 && (
          <Badge variant="outline" className={impactLevelConfig.high.className}>
            높음: {summary.high}
          </Badge>
        )}
        {summary.critical > 0 && (
          <Badge variant="outline" className={impactLevelConfig.critical.className}>
            치명적: {summary.critical}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Affected part card component
 */
interface AffectedPartCardProps {
  part: AffectedPart;
  detailed: boolean;
  collapsible: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function AffectedPartCard({
  part,
  detailed,
  collapsible,
  isExpanded,
  onToggleExpand,
}: AffectedPartCardProps) {
  const level = part.impactLevel || "none";
  const config = impactLevelConfig[level];
  const Icon = config.icon;
  const hasDetails = detailed && (part.affectedAssemblies?.length || part.affectedDocuments?.length || part.impactDescription);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-between p-3 hover:bg-muted/50",
              !collapsible && !hasDetails && "cursor-default"
            )}
            disabled={!collapsible || !hasDetails}
          >
            <div className="flex items-center gap-3 flex-1 text-left">
              {/* Impact icon */}
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", config.className)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Part info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{part.partNumber}</p>
                  {part.revision && (
                    <Badge variant="outline" className="text-xs">
                      Rev {part.revision}
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn("text-xs", config.className)}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{part.name}</p>
                {part.category && (
                  <p className="text-xs text-muted-foreground">{part.category}</p>
                )}
              </div>

              {/* Expand icon */}
              {(collapsible && hasDetails) && (
                <>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded content */}
        {hasDetails && (
          <CollapsibleContent>
            <div className="p-3 pt-0 border-t space-y-3">
              {/* Impact description */}
              {part.impactDescription && (
                <div className="text-sm">
                  <p className="font-medium mb-1">영향 설명</p>
                  <p className="text-muted-foreground">{part.impactDescription}</p>
                </div>
              )}

              {/* Affected assemblies */}
              {part.affectedAssemblies && part.affectedAssemblies.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Boxes className="h-3 w-3" />
                    관련 조립품 ({part.affectedAssemblies.length})
                  </p>
                  <div className="space-y-1">
                    {part.affectedAssemblies.map((assembly) => (
                      <div
                        key={assembly.id}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                      >
                        <span className="font-medium">{assembly.assemblyNumber}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{assembly.assemblyName}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Qty: {assembly.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected documents */}
              {part.affectedDocuments && part.affectedDocuments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    관련 문서 ({part.affectedDocuments.length})
                  </p>
                  <div className="space-y-1">
                    {part.affectedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30"
                      >
                        <span className="font-medium">{doc.documentNumber}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="flex-1 truncate">{doc.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}

/**
 * Compact version of impact analysis
 */
export interface ImpactAnalysisCompactProps {
  changeOrderId: string;
  className?: string;
}

export function ImpactAnalysisCompact({
  changeOrderId,
  className,
}: ImpactAnalysisCompactProps) {
  const { data: impactData, isLoading } = trpc.plm.changeOrder.impactAnalysis.useQuery(
    { changeOrderId },
    { enabled: !!changeOrderId }
  );

  if (isLoading || !impactData || impactData.length === 0) {
    return null;
  }

  const affectedParts = impactData as AffectedPart[];
  const totalParts = affectedParts.length;
  const highImpactCount = affectedParts.filter(
    (p) => p.impactLevel === "high" || p.impactLevel === "critical"
  ).length;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Package className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{totalParts}개 부품 영향</span>
      {highImpactCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {highImpactCount} 높음/치명적
        </Badge>
      )}
    </div>
  );
}
