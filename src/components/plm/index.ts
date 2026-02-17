// PLM Components - Parts and BOM Management
export { PartList } from "./PartList";
export { PartDetail } from "./PartDetail";
export { PartStatusBadge } from "./PartStatusBadge";
export { BomTree, type BomTreeFilter } from "./BomTree";
export { BomTreeFilters } from "./BomTreeFilters";
export { BomFlatTable } from "./BomFlatTable";
export {
  RevisionTimeline,
  type RevisionTimelineItem,
  type RevisionStatus,
} from "./RevisionTimeline";
export { WhereUsedTable } from "./WhereUsedTable";
export { BomAddItemDialog } from "./BomAddItemDialog";

// Legacy components (to be refactored)
export { StatusBadge, type StatusBadgeProps } from "./status-badge";
export { BOMFilters, type BOMFilter } from "./bom-filters";
export { BOMTable, type BOMPart } from "./bom-table";
export { PLMStats, type PLMStatItem } from "./plm-stats";
export { CADFileList, type CADFile } from "./cad-file-list";
export {
  ChangeHistory,
  type ChangeRequest,
  type ChangeRequestType,
} from "./change-history";
export {
  ApprovalTimeline,
  type ApprovalStep,
  type ApprovalStepStatus,
} from "./approval-timeline";
