# SPEC-PLM-009: 변경 주문 고급 기능 (Change Order Advanced Features)

**SPEC ID**: SPEC-PLM-009
**Title**: Change Order Advanced Features - Export and Batch Processing
**Created**: 2026-02-18
**Status**: Planned
**Priority**: Medium
**Domain**: PLM
**Related SPECs**: SPEC-PLM-006 (Change Order Workflow), SPEC-PLM-008 (Phase 1 Cleanup)
**Development Mode**: Hybrid (TDD for new, DDD for legacy)

---

## Problem Analysis

### Current State

PLM System Web 프로젝트의 SPEC-PLM-006에서 변경 주문 워크플로우(ECR/ECN)가 구현되었습니다. 현재 다음 기능들이 사용 가능합니다:

1. **기본 워크플로우**: 생성, 제출, 검토, 승인/거부, 구현 완료
2. **필터링**: 상태, 유형, 우선순위 필터
3. **검색**: 제목, 번호, 설명 검색
4. **CSV 내보내기**: 기본 CSV 내보내기 (이미 `export` procedure 구현됨)

하지만 다음 고급 기능이 부족합니다:

1. **PDF 내보내기**: 보고서용 PDF 형식 지원 없음
2. **내보내기 옵션**: 선택 항목 내보내기, 필드 선택 기능 없음
3. **일괄 처리**: 다중 선택 후 대량 승인/거부 기능 없음
4. **진행 상황 표시**: 대량 작업 시 진행 상황 피드백 없음

### Root Cause Analysis (Five Whys)

1. **Surface Problem**: 변경 주문 고급 기능(내보내기, 일괄 처리)이 구현되지 않음
2. **First Why**: SPEC-PLM-006에서 핵심 워크플로우에 집중함
3. **Second Why**: P3 우선순위 기능으로 분류되어 나중으로 미뤄짐
4. **Third Why**: 내보내기 및 일괄 처리는 UX 개선 기능으로 간주됨
5. **Fourth Why**: MVP 단계에서는 필수 기능이 아니었음
6. **Root Cause**: Phase 3 선택적 기능으로 별도 SPEC 필요

### Assumptions

| Assumption | Confidence | Evidence | Risk if Wrong |
|------------|------------|----------|---------------|
| 기본 CSV 내보내기가 작동함 | High | `plm.changeOrder.export` procedure 존재 | 디버깅 필요 |
| jsPDF/react-pdf 사용 가능 | High | React 19 호환 라이브러리 | 대안 필요시 json2pdf |
| 대량 작업 트랜잭션 처리 가능 | High | Drizzle ORM 트랜잭션 지원 | 성능 이슈 시 배치 처리 |
| shadcn/ui Dialog 컴포넌트 사용 가능 | High | 이미 프로젝트에 설치됨 | 커스텀 구현 |

---

## Requirements (EARS Format)

### 1. Change Order Export (C-003)

#### Ubiquitous Requirements

- The system **shall** support exporting change orders in CSV and PDF formats.
- The system **shall** preserve all filter settings when exporting filtered results.
- The system **shall** include metadata (export date, project name, filter criteria) in exported files.

#### Event-Driven Requirements

- **WHEN** user clicks export button, **THEN** the system **shall** display export dialog with format options.
- **WHEN** user selects CSV format, **THEN** the system **shall** generate downloadable CSV file.
- **WHEN** user selects PDF format, **THEN** the system **shall** generate formatted PDF report.
- **WHEN** export is initiated, **THEN** the system **shall** show loading indicator during generation.

#### State-Driven Requirements

- **IF** items are selected in the list, **THEN** the system **shall** offer option to export only selected items.
- **IF** filters are applied, **THEN** the system **shall** export only filtered results by default.
- **IF** no filters are applied and no selection exists, **THEN** the system **shall** export all items with confirmation.

#### Unwanted Behavior Requirements

- The system **shall not** export items user does not have permission to view.
- The system **shall not** allow export of more than 1000 items at once (performance protection).

#### Optional Requirements

- Where possible, the system **shall** allow users to select which fields to include in export.
- Where possible, the system **shall** support custom PDF templates for branding.

### 2. Batch Processing (C-004)

#### Ubiquitous Requirements

- The system **shall** support batch approve and batch reject operations.
- The system **shall** require user confirmation before executing batch operations.
- The system **shall** log all batch operations in the audit trail.

#### Event-Driven Requirements

- **WHEN** user selects multiple items, **THEN** the system **shall** display batch action toolbar.
- **WHEN** user clicks batch approve, **THEN** the system **shall** show confirmation dialog with selected item count.
- **WHEN** user confirms batch approve, **THEN** the system **shall** process items sequentially and show progress.
- **WHEN** batch operation completes, **THEN** the system **shall** display summary (success count, failure count).

#### State-Driven Requirements

- **IF** selected items have mixed statuses, **THEN** the system **shall** only allow operations valid for all selected items.
- **IF** batch operation fails on some items, **THEN** the system **shall** continue with remaining items and report failures.
- **IF** user is not authorized for batch operation, **THEN** the system **shall** disable batch action buttons.

#### Unwanted Behavior Requirements

- The system **shall not** allow batch operations on items already in final state (approved, rejected, implemented).
- The system **shall not** allow batch operations that would violate state transition rules.

#### Optional Requirements

- Where possible, the system **shall** support batch status change to any valid target state.
- Where possible, the system **shall** allow adding common comment to all batch processed items.

### 3. Selection Management

#### Ubiquitous Requirements

- The system **shall** provide multi-select functionality for change order list items.
- The system **shall** persist selection across page navigation within the same session.
- The system **shall** display selected item count in the UI.

#### Event-Driven Requirements

- **WHEN** user clicks item checkbox, **THEN** the system **shall** toggle item selection.
- **WHEN** user clicks select all checkbox, **THEN** the system **shall** select all visible items.
- **WHEN** user applies filter, **THEN** the system **shall** preserve selection of items still visible.

#### State-Driven Requirements

- **IF** select all is clicked, **THEN** the system **shall** select only visible items (not all items in database).
- **IF** selection exceeds 50 items, **THEN** the system **shall** show warning about potential performance impact.

---

## Specifications

### File Modification List

#### New Files

| File Path | Description |
|-----------|-------------|
| `src/modules/plm/export.ts` | Export utilities (CSV, PDF generation) |
| `src/components/changes/export-dialog.tsx` | Export dialog component |
| `src/components/changes/batch-actions.tsx` | Batch action toolbar and dialog |
| `src/components/changes/batch-confirm-dialog.tsx` | Batch operation confirmation dialog |
| `src/components/changes/selection-provider.tsx` | Selection state context provider |

#### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/modules/plm/router.ts` | Add `batchApprove`, `batchReject`, `exportPdf` procedures |
| `src/modules/plm/change-order-service.ts` | Add batch processing functions |
| `src/components/changes/change-order-list.tsx` | Add checkbox selection, batch action integration |
| `src/app/projects/[key]/changes/change-order-list-client.tsx` | Add export button, selection state management |

### Technical Constraints

1. **PDF Generation**: Use @react-pdf/renderer or jsPDF with autotable
2. **CSV Export**: Use existing papaparse or native CSV generation
3. **Batch Size Limit**: Maximum 50 items per batch operation
4. **Transaction Handling**: Use Drizzle transaction for batch operations
5. **UI Components**: Shadcn/ui Dialog, Progress, Checkbox components
6. **Progress Tracking**: Use React state with optimistic updates

### Database Schema Changes

No schema changes required. All features use existing tables:
- `change_orders` - Main change order data
- `change_order_audit_trail` - Audit logging for batch operations

### API Procedures

#### New tRPC Procedures

```typescript
plm.changeOrder.batchApprove
  - Input: { changeOrderIds: string[], comment?: string }
  - Output: { successCount: number, failedCount: number, errors: Array<{id, reason}> }

plm.changeOrder.batchReject
  - Input: { changeOrderIds: string[], reason: string }
  - Output: { successCount: number, failedCount: number, errors: Array<{id, reason}> }

plm.changeOrder.exportPdf
  - Input: { projectId: string, ids?: string[], status?: enum, type?: enum }
  - Output: { filename: string, content: string } // Base64 encoded PDF
```

### Quality Gates

- **Tested**: 85%+ coverage, unit tests for export and batch functions
- **Readable**: Clear naming, English comments
- **Unified**: Consistent formatting with Biome
- **Secured**: Permission checks on batch operations
- **Trackable**: All batch operations logged in audit trail

---

## Traceability

| Requirement ID | Source | Verification Method |
|----------------|--------|---------------------|
| C-003-001 | SPEC-PLM-006 P3 | Unit test + E2E test |
| C-003-002 | SPEC-PLM-006 P3 | Unit test |
| C-003-003 | SPEC-PLM-006 P3 | E2E test |
| C-004-001 | SPEC-PLM-006 P3 | Integration test |
| C-004-002 | SPEC-PLM-006 P3 | Unit test + E2E test |
| C-004-003 | SPEC-PLM-006 P3 | Integration test |

---

## Dependencies

### Upstream Dependencies
- SPEC-PLM-006: Change order workflow (must be complete)
- SPEC-PLM-008: Phase 1 cleanup (codebase must be stable)

### Downstream Dependencies
- Future reporting SPECs may use export infrastructure
- Future batch operations may extend batch processing patterns

---

## Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PDF library compatibility issues | Medium | Medium | Test both jsPDF and @react-pdf/renderer |
| Large batch performance | Medium | High | Implement 50-item limit, show progress |
| Selection state loss on filter | Low | Low | Use React context for selection persistence |
| Export timeout for large datasets | Medium | Medium | Implement pagination-based export |

---

## References

- [EARS Specification Pattern](https://alistairmavin.com/ears/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [TRUST 5 Framework](.claude/rules/moai/core/moai-constitution.md)
- [SPEC-PLM-006](../SPEC-PLM-006/) - Change Order Workflow
