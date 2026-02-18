# Plan: Task List Update After Project Review

**Date**: 2026-02-18
**Team**: moai-plan-task-list-update
**Status**: In Progress

---

## Overview

프로젝트 리뷰 후 누적된 변경사항을 분석하고 구조화된 작업 목록을 생성합니다.

---

## Accumulated Changes Analysis

### 1. SSE (Server-Sent Events) Implementation
**Files**:
- `src/app/api/sse/notifications/route.ts` - SSE endpoint 구현
- `src/hooks/use-sse-notifications.ts` - SSE client hook

**Status**: Partially Complete
**Issues Identified**:
- No connection pooling for multiple tabs from same user
- Missing exponential backoff on reconnection (fixed 3s delay)
- No tests for SSE endpoint
- Helper functions (`sendNotificationToUser`, `broadcastNotification`) not integrated with notification creation

---

### 2. Change Order Components
**Files**:
- `src/components/changes/change-order-list.tsx` - Core list component
- `src/app/projects/[key]/changes/change-order-list-client.tsx` - Client wrapper with tabs

**Status**: Functional
**Issues Identified**:
- Filter state not synchronized with URL query parameters
- No empty state for filtered results (only for overall empty list)
- Tab changes trigger full component re-renders
- Search debouncing not implemented

---

### 3. Project Dashboard
**Files**:
- `src/app/projects/[key]/dashboard/dashboard-client.tsx` - Dashboard client

**Status**: Functional
**Issues Identified**:
- Date range filter state not shareable via URL
- No error boundaries for dashboard queries
- Loading states could be improved for individual widgets

---

### 4. Test Coverage
**Files Added**:
- `tests/unit/project/schemas.test.ts`
- `tests/unit/project/service.test.ts`
- `tests/unit/project/milestone-service.test.ts`
- `tests/unit/project/schema-validation.test.ts`
- `tests/unit/project/service-async.test.ts`
- `tests/unit/project/router-error-handling.test.ts`
- `tests/integration/project/project-members-flow.test.ts`
- `tests/integration/project/project-router.test.ts`
- `tests/integration/project/project-isolation.test.ts`
- `tests/integration/project/milestone-crud-flow.test.ts`
- `tests/integration/project/project-crud-flow.test.ts`
- `tests/integration/project/service-characterization.test.ts`
- `src/modules/project/__tests__/service.test.ts`

**Status**: Tests created, execution status unknown
**Issues Identified**:
- No SSE endpoint tests
- No hook tests (`use-sse-notifications.ts`)
- Coverage metrics not verified

---

## User Stories & Acceptance Criteria

### US-1: SSE Notification System Completion
**Priority**: High
**Category**: Feature

**Acceptance Criteria**:
- When a client connects to `/api/sse/notifications`, the system shall establish a persistent SSE connection
- When a new notification is created, the system shall broadcast it to connected clients
- When a client disconnects, the system shall clean up connection resources
- While SSE connection is active, the system shall send keep-alive messages every 30 seconds
- Where SSE connection fails, the system shall attempt reconnection with exponential backoff

**Technical Tasks**:
1. Add exponential backoff to client reconnection logic
2. Implement connection pooling (handle multiple tabs per user)
3. Integrate SSE helpers with notification creation workflow
4. Add SSE endpoint tests

---

### US-2: Change Order List URL State Sync
**Priority**: Medium
**Category**: Feature

**Acceptance Criteria**:
- When user applies filters, the system shall update URL query parameters
- When page loads with query parameters, filters shall be applied automatically
- When browser back/forward is used, filter state shall be preserved

**Technical Tasks**:
1. Sync search query with URL
2. Sync priority filter with URL
3. Sync tab selection with URL (status + type filters)
4. Add empty state for filtered results

---

### US-3: Dashboard URL State & Error Boundaries
**Priority**: Low
**Category**: Improvement

**Acceptance Criteria**:
- When user selects date range, URL shall be updated
- When dashboard query fails, error boundary shall show appropriate message

**Technical Tasks**:
1. Sync date range preset with URL
2. Add error boundaries for dashboard widgets
3. Improve per-widget loading states

---

### US-4: Test Coverage Verification
**Priority**: High
**Category**: Test

**Acceptance Criteria**:
- When tests run, coverage shall be >=85% for project modules
- When SSE code changes, SSE tests shall exist

**Technical Tasks**:
1. Run existing tests and verify they pass
2. Generate coverage report
3. Add SSE endpoint tests
4. Add hook tests for `use-sse-notifications.ts`
5. Fill coverage gaps

---

## Edge Cases

1. **SSE Multiple Tabs**: Same user opens multiple tabs → creates multiple connections
2. **SSE Reconnection Storm**: Server restart → all clients try to reconnect simultaneously
3. **Filter URL Overflow**: Long search queries → URL becomes too long
4. **Dashboard Race Condition**: Multiple dashboard queries complete at different times
5. **Test Isolation**: Integration tests affecting each other's database state

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SSE memory leaks | High | Medium | Add connection monitoring, implement max connections per user |
| Test coverage below 85% | Medium | Low | Identify gaps early, add targeted tests |
| URL state sync breaks navigation | Low | Medium | Thorough testing of browser back/forward |
| Breaking existing filter functionality | Medium | Low | Add tests before modifying URL sync logic |

---

## Recommended Task Order

| Order | Task | Estimated Complexity | Dependencies |
|-------|------|---------------------|--------------|
| 1 | Verify test coverage baseline | Low | None |
| 2 | SSE endpoint tests | Medium | None |
| 3 | SSE connection pooling | Medium | None |
| 4 | SSE exponential backoff | Low | None |
| 5 | Change Order URL sync | Medium | None |
| 6 | Hook tests for SSE | Low | None |
| 7 | Dashboard URL sync | Low | None |
| 8 | Dashboard error boundaries | Low | None |
| 9 | Final coverage verification | Low | All above |

---

## Open Questions

1. Should SSE connection pooling limit connections per user? (Recommended: 5 max)
2. Should filter state persist across sessions using localStorage? (Currently: no)
3. What is the target deployment environment for SSE? (Vercel supports SSE)

---

## Next Steps

1. User reviews and approves this plan
2. Execute `/moai run` with this plan as SPEC
3. Track progress via TaskList
