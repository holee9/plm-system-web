# SPEC-PLM-008: Phase 1 Changes Commit and Cleanup

**SPEC ID**: SPEC-PLM-008
**Title**: Phase 1 Changes Commit and Cleanup
**Created**: 2026-02-18
**Status**: Planned
**Priority**: High
**Domain**: PLM
**Related SPECs**: SPEC-PLM-006, SPEC-PLM-007
**Development Mode**: Hybrid (TDD for new, DDD for legacy)

---

## Problem Analysis

### Current State

PLM System Web 프로젝트는 Phase 3 (PLM Workflows)까지 약 95% 완료된 상태입니다. 현재 다음과 같은 변경사항이 staging되지 않은 상태로 축적되어 있습니다:

1. **SSE (Server-Sent Events) 실시간 알림 구현**
   - `/api/sse/notifications` 엔드포인트 생성
   - `use-sse-notifications.ts` Hook 구현
   - 인증 연동 완료 (Auth.js v5)

2. **변경 주문 필터링 기능 추가**
   - 우선순위 필터 UI
   - 고급 필터 패널 토글
   - 상태/유형 필터링

3. **대시보드 기간 선택 기능 추가**
   - 기간 선택 UI (전체, 7일, 30일, 3개월, 1년)
   - 날짜 범위 쿼리 파라미터 연동

4. **프로젝트 관련 테스트 파일 추가**
   - 통합 테스트 (integration/project/)
   - 단위 테스트 (unit/project/)
   - 서비스 테스트 (src/modules/project/__tests__/)

### Root Cause Analysis (Five Whys)

1. **Surface Problem**: 변경사항이 커밋되지 않고 축적됨
2. **First Why**: 개발 속도 우선으로 커밋 지연
3. **Second Why**: 다수 기능이 병렬로 개발됨
4. **Third Why**: 명확한 커밋 단위 정의 부족
5. **Fourth Why**: SPEC-First 접근법에서 정리 단계 누락
6. **Root Cause**: Phase 완료 후 정리 작업을 위한 전용 SPEC 필요

### Assumptions

| Assumption | Confidence | Evidence | Risk if Wrong |
|------------|------------|----------|---------------|
| 모든 테스트가 통과함 | High | 기존 테스트 커버리지 85%+ | 테스트 실패 시 디버깅 필요 |
| 타입 에러가 없음 | High | TypeScript strict mode | 타입 에러 시 수정 필요 |
| 린트 에러가 없음 | Medium | Biome 설정 확인 필요 | 린트 에러 시 포맷팅 필요 |
| SSE 구현이 완료됨 | High | 코드 리뷰 완료 | 추가 개발 필요 |

---

## Requirements (EARS Format)

### 1. SSE Notification System Verification

#### Ubiquitous Requirements

- The system **shall** verify all SSE notification components are complete and functional.
- The system **shall** ensure SSE connection management handles reconnection properly.

#### Event-Driven Requirements

- **WHEN** a user connects to `/api/sse/notifications`, **THEN** the system **shall** authenticate via Auth.js v5 JWT token.
- **WHEN** SSE connection is established, **THEN** the system **shall** send keep-alive messages every 30 seconds.
- **WHEN** a notification event occurs, **THEN** the system **shall** broadcast to connected clients via EventSource.

#### State-Driven Requirements

- **IF** connection is lost, **THEN** the client **shall** attempt reconnection with 3-second delay.
- **IF** user is not authenticated, **THEN** the system **shall** return 401 Unauthorized response.

#### Unwanted Behavior Requirements

- The system **shall not** allow SSE connections without valid authentication.
- The system **shall not** buffer SSE messages indefinitely (memory leak prevention).

#### Optional Requirements

- Where possible, the system **shall** support connection pooling for scalability.
- Where possible, the system **shall** implement exponential backoff for reconnection.

### 2. Change Order List Enhancement Verification

#### Ubiquitous Requirements

- The system **shall** support filtering by status, type, and priority.
- The system **shall** provide search functionality for title, number, and description.

#### Event-Driven Requirements

- **WHEN** user applies priority filter, **THEN** the list **shall** update immediately.
- **WHEN** user toggles advanced filter panel, **THEN** the UI **shall** expand/collapse smoothly.

#### State-Driven Requirements

- **IF** filters are applied, **THEN** the filtered result count **shall** be displayed.
- **IF** search query is empty, **THEN** all items matching other filters **shall** be shown.

#### Optional Requirements

- Where possible, filters **shall** sync with URL query parameters for shareability.

### 3. Dashboard Period Selection Verification

#### Ubiquitous Requirements

- The system **shall** provide period selection dropdown (all, 7d, 30d, 90d, 1y).
- The system **shall** filter all dashboard data based on selected period.

#### Event-Driven Requirements

- **WHEN** user selects a period, **THEN** all charts and statistics **shall** refresh with filtered data.
- **WHEN** period changes, **THEN** tRPC queries **shall** refetch with new date parameters.

#### State-Driven Requirements

- **IF** "all" is selected, **THEN** date range filters **shall** be omitted from queries.
- **IF** a specific period is selected, **THEN** start/end dates **shall** be calculated and passed.

#### Optional Requirements

- Where possible, selected period **shall** sync with URL for bookmarkability.

### 4. Test Coverage Verification

#### Ubiquitous Requirements

- The system **shall** maintain 85%+ test coverage for all modified modules.
- All existing tests **shall** pass before commit.

#### Event-Driven Requirements

- **WHEN** `npm test` is executed, **THEN** all unit tests **shall** pass.
- **WHEN** `npm run typecheck` is executed, **THEN** no type errors **shall** be reported.

#### State-Driven Requirements

- **IF** test coverage is below 85%, **THEN** additional tests **shall** be written.

### 5. Git Commit Organization

#### Ubiquitous Requirements

- Changes **shall** be committed in logical groups following Conventional Commits.

#### Event-Driven Requirements

- **WHEN** committing SSE changes, **THEN** the commit message **shall** follow format `feat(notification): implement SSE real-time notifications`.
- **WHEN** committing filter changes, **THEN** the commit message **shall** follow format `feat(change-order): add priority and advanced filtering`.
- **WHEN** committing dashboard changes, **THEN** the commit message **shall** follow format `feat(dashboard): add period selection for data filtering`.
- **WHEN** committing test changes, **THEN** the commit message **shall** follow format `test(project): add integration and unit tests`.

---

## Specifications

### File Modification List

#### New Files (SSE Implementation)
- `src/app/api/sse/notifications/route.ts` - SSE endpoint with Auth.js integration

#### Modified Files (SSE Hook)
- `src/hooks/use-sse-notifications.ts` - SSE connection management hook

#### Modified Files (Change Order Filtering)
- `src/app/projects/[key]/changes/change-order-list-client.tsx` - Priority filter, advanced filter UI
- `src/components/changes/change-order-list.tsx` - priorityFilter prop support

#### Modified Files (Dashboard Period Selection)
- `src/app/projects/[key]/dashboard/dashboard-client.tsx` - Period selection UI, date range queries

#### New Files (Tests)
- `tests/integration/project/milestone-crud-flow.test.ts`
- `tests/integration/project/project-crud-flow.test.ts`
- `tests/integration/project/project-isolation.test.ts`
- `tests/integration/project/project-members-flow.test.ts`
- `tests/integration/project/service-characterization.test.ts`
- `tests/unit/project/milestone-service.test.ts`
- `tests/unit/project/router-error-handling.test.ts`
- `tests/unit/project/schema-validation.test.ts`
- `tests/unit/project/service-async.test.ts`
- `src/modules/project/__tests__/*` (if any)

### Technical Constraints

1. **Authentication**: Auth.js v5 with JWT strategy
2. **API Layer**: tRPC v11 for type-safe queries
3. **Testing**: Vitest for unit tests, Playwright for E2E
4. **Linting**: Biome for code quality
5. **Type Safety**: TypeScript 5.7 strict mode

### Quality Gates

- **Tested**: 85%+ coverage, all tests passing
- **Readable**: Clear naming, English comments
- **Unified**: Consistent formatting with Biome
- **Secured**: Auth.js integration verified
- **Trackable**: Conventional Commits format

---

## Traceability

| Requirement ID | Source | Verification Method |
|----------------|--------|---------------------|
| SSE-001 | SPEC-PLM-007 D-005 | Manual test + code review |
| FILTER-001 | SPEC-PLM-006 C-001, C-002 | Unit test + manual test |
| PERIOD-001 | SPEC-PLM-007 D-014 | Integration test |
| TEST-001 | TRUST 5 | Coverage report |
| COMMIT-001 | Conventional Commits | Git history |

---

## Dependencies

### Upstream Dependencies
- SPEC-PLM-002: Auth.js v5 authentication system
- SPEC-PLM-006: Change order workflow (filtering requirements)
- SPEC-PLM-007: Dashboard and notifications (SSE requirements)

### Downstream Dependencies
- Future SPECs may depend on stable SSE infrastructure
- Test coverage baseline affects future development velocity

---

## Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test failures block commit | Medium | High | Run tests locally before commit |
| Type errors in new code | Low | Medium | TypeScript strict mode catches early |
| SSE connection issues in prod | Low | High | Add monitoring and alerting |
| Large diff difficult to review | Medium | Medium | Split into logical commits |

---

## References

- [EARS Specification Pattern](https://alistairmavin.com/ears/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TRUST 5 Framework](.claude/rules/moai/core/moai-constitution.md)
- [SPEC-PLM-007](../SPEC-PLM-007/) - Dashboard and Notifications
- [SPEC-PLM-006](../SPEC-PLM-006/) - Change Order Workflow
