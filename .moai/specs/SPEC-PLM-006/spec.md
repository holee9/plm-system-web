# SPEC-PLM-006: 변경 주문 워크플로우 (PLM)

## Metadata

- ID: SPEC-PLM-006
- Status: Draft
- Priority: P2
- Size: L
- Dependencies: SPEC-PLM-005
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

PLM 변경 관리 프로세스인 ECR(Engineering Change Request) / ECN(Engineering Change Notice) 워크플로우를 구현합니다.
변경 요청 생성, 제출, 검토, 승인/거부, 구현 완료의 라이프사이클을 관리하며,
다중 승인자 지원, 감사 추적(Audit Trail), 영향 분석을 포함합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: **WHEN** 사용자가 변경 주문 생성 요청을 보내면 **THEN** 시스템은 고유 번호(ECR-001, ECN-001)를 부여하여 변경 주문을 생성해야 한다
- FR-002: 시스템은 변경 주문 유형을 **항상** ECR(변경 요청)과 ECN(변경 통지) 2가지로 구분해야 한다
- FR-003: **WHEN** 변경 주문의 상태가 변경되면 **THEN** 시스템은 모든 상태 변경을 감사 추적(Audit Trail)에 기록해야 한다
- FR-004: **WHEN** 작성자가 변경 주문을 제출하면 **THEN** 시스템은 상태를 submitted로 변경하고 승인자에게 알려야 한다
- FR-005: **WHEN** 승인자가 검토 요청을 수락하면 **THEN** 시스템은 상태를 in_review로 변경해야 한다
- FR-006: **WHEN** 모든 승인자가 승인하면 **THEN** 시스템은 상태를 approved로 변경해야 한다
- FR-007: **WHEN** 하나라도 거부가 발생하면 **THEN** 시스템은 상태를 rejected로 변경하고 거부 사유를 기록해야 한다
- FR-008: **WHEN** 거부된 변경 주문이 수정 후 재제출되면 **THEN** 시스템은 이전 검토 이력을 보존하며 새 검토 사이클을 시작해야 한다
- FR-009: **WHEN** 승인된 변경 주문이 구현 완료되면 **THEN** 시스템은 상태를 implemented로 변경하고 관련 부품 리비전을 연결해야 한다
- FR-010: **WHEN** 변경 주문에 영향받는 부품을 조회하면 **THEN** 시스템은 관련 부품 및 BOM 목록을 반환해야 한다
- FR-011: **가능하면** 변경 주문 승인 시 관련 이슈를 자동 생성하는 기능을 제공한다

### Non-Functional Requirements

- NFR-001: 감사 추적 기록은 **항상** 삭제 불가하며 영구 보존되어야 한다
- NFR-002: 변경 주문 상태 변경은 트랜잭션으로 원자적으로 처리되어야 한다
- NFR-003: 승인 프로세스는 병렬 승인(모든 승인자 동시 검토) 방식을 기본으로 해야 한다

---

## User Stories

- US-001: 엔지니어로서, 변경 요청(ECR)을 생성할 수 있어야 한다, 그래야 제품 변경을 공식 제안할 수 있다
- US-002: 엔지니어로서, 변경 주문에 영향받는 부품을 지정할 수 있어야 한다, 그래야 변경 범위를 명확히 할 수 있다
- US-003: 승인자로서, 변경 주문을 검토하고 승인/거부할 수 있어야 한다, 그래야 변경 품질을 보장할 수 있다
- US-004: 프로젝트 관리자로서, 변경 주문의 전체 이력을 추적할 수 있어야 한다, 그래야 감사 요구사항을 충족할 수 있다
- US-005: 엔지니어로서, 거부된 변경 주문을 수정하고 재제출할 수 있어야 한다, 그래야 피드백을 반영할 수 있다

---

## Acceptance Criteria

- AC-001: Given 사용자가 변경 주문을 생성할 때, When 유형, 제목, 설명, 영향 부품을 입력하면, Then 고유 번호가 부여된 변경 주문이 draft 상태로 생성된다
- AC-002: Given 변경 주문이 draft 상태일 때, When 제출하면, Then 상태가 submitted로 변경되고 승인자 목록에 알림이 발생한다
- AC-003: Given 변경 주문이 submitted 상태일 때, When 승인자가 검토를 시작하면, Then 상태가 in_review로 변경된다
- AC-004: Given 2명의 승인자가 배정되었을 때, When 2명 모두 승인하면, Then 상태가 approved로 변경된다
- AC-005: Given 2명의 승인자 중, When 1명이 거부하면, Then 상태가 rejected로 변경되고 거부 사유가 기록된다
- AC-006: Given 거부된 변경 주문을, When 수정 후 재제출하면, Then 이전 검토 이력이 보존되고 새 검토 사이클이 시작된다
- AC-007: Given 승인된 변경 주문을, When 구현 완료 처리하면, Then 상태가 implemented로 변경된다
- AC-008: Given 변경 주문의 상태가 변경될 때마다, When 감사 추적을 조회하면, Then 모든 상태 변경이 시간/사용자 정보와 함께 기록되어 있다
- AC-009: Given 변경 주문에 영향 부품이 지정되었을 때, When 영향 분석을 실행하면, Then 관련 부품 및 BOM 목록이 표시된다

---

## Technical Design

### Module: plm (SPEC-PLM-005와 동일 모듈)

### Database Tables

**change_orders**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| number | varchar(20) | UNIQUE within project, NOT NULL |
| type | enum('ecr','ecn') | NOT NULL |
| title | varchar(500) | NOT NULL |
| description | text | nullable |
| reason | text | nullable (변경 사유) |
| status | enum('draft','submitted','in_review','approved','rejected','implemented') | NOT NULL, default 'draft' |
| priority | enum('urgent','high','medium','low') | NOT NULL, default 'medium' |
| created_by | uuid | FK -> users.id, NOT NULL |
| affected_parts | uuid[] | 영향받는 부품 ID 배열 |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

**change_order_approvals**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| change_order_id | uuid | FK -> change_orders.id, NOT NULL |
| approver_id | uuid | FK -> users.id, NOT NULL |
| status | enum('pending','approved','rejected') | NOT NULL, default 'pending' |
| comment | text | nullable (승인/거부 코멘트) |
| reviewed_at | timestamp | nullable |
| created_at | timestamp | NOT NULL |

### 상태 전이 규칙

```
draft -> submitted (작성자)
submitted -> in_review (승인자가 검토 시작)
in_review -> approved (모든 승인자 승인)
in_review -> rejected (1명이라도 거부)
rejected -> draft (작성자가 수정 시작)
approved -> implemented (구현 완료)
```

### tRPC Procedures

```
plm.changeOrder.router
├── create             # mutation: 변경 주문 생성
├── list               # query: 변경 주문 목록 (필터, 페이지네이션)
├── getById            # query: 변경 주문 상세
├── update             # mutation: 변경 주문 수정 (draft 상태만)
├── submit             # mutation: 제출 (draft -> submitted)
├── startReview        # mutation: 검토 시작 (submitted -> in_review)
├── approve            # mutation: 승인 (승인자)
├── reject             # mutation: 거부 (승인자, 사유 필수)
├── revise             # mutation: 재수정 (rejected -> draft)
├── implement          # mutation: 구현 완료 (approved -> implemented)
├── addApprover        # mutation: 승인자 추가
├── removeApprover     # mutation: 승인자 제거
├── getAuditTrail      # query: 감사 추적 조회
└── getImpactAnalysis  # query: 영향 분석 (관련 부품/BOM)
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/projects/[key]/changes` | 변경 주문 목록 | Protected (멤버) |
| `/projects/[key]/changes/new` | 변경 주문 생성 | Protected (멤버) |
| `/projects/[key]/changes/[id]` | 변경 주문 상세 | Protected (멤버) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `ChangeOrderList` | 변경 주문 목록 테이블 |
| `ChangeOrderCreateForm` | 변경 주문 생성 폼 |
| `ChangeOrderDetail` | 변경 주문 상세 뷰 |
| `ChangeOrderStatusBadge` | 상태 배지 |
| `ChangeOrderTimeline` | 상태 변경 타임라인 (감사 추적) |
| `ApprovalPanel` | 승인/거부 패널 (승인자용) |
| `ApproverList` | 승인자 목록 (상태 표시) |
| `ImpactAnalysisPanel` | 영향 분석 패널 (관련 부품/BOM) |
| `AffectedPartSelector` | 영향 부품 선택기 |
| `AuditTrailTable` | 감사 추적 테이블 |

---

## Edge Cases & Risks

- EC-001: 다중 승인자 병렬 검토 - 모든 승인자가 독립적으로 승인/거부, 1명 거부 시 전체 거부
- EC-002: 거부 후 재제출 - 이전 승인 결과 초기화, 새 승인 사이클 시작, 이전 이력 보존
- EC-003: 부분 승인 - MVP에서는 미지원, 전원 승인 필요
- EC-004: 승인자 변경 - pending 상태 승인자만 추가/제거 가능
- EC-005: 관련 이슈 자동 생성 - 승인 시 issue 모듈 이벤트 발행으로 연동 (선택사항)
- EC-006: 변경 주문 삭제 - draft 상태에서만 삭제 가능, 제출 이후 삭제 불가
- RISK-001: 승인 상태 일관성 -> 트랜잭션 내에서 승인 상태 + 변경 주문 상태 동시 업데이트 (영향: 높음)
- RISK-002: 감사 추적 무결성 -> 감사 로그 테이블은 UPDATE/DELETE 금지, INSERT만 허용 (영향: 높음)
- RISK-003: 이벤트 기반 모듈 간 통신 -> In-process event bus 신뢰성 (영향: 중간)

---

## Files to Create/Modify

### 신규 생성 파일 (~12개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/plm/schemas/change-orders.ts` | change_orders 테이블 스키마 |
| `src/modules/plm/schemas/change-order-approvals.ts` | change_order_approvals 스키마 |
| `src/modules/plm/change-order-router.ts` | 변경 주문 tRPC 라우터 |
| `src/modules/plm/change-order-service.ts` | 변경 주문 비즈니스 로직 |
| `src/modules/plm/change-order-machine.ts` | 변경 주문 상태 전이 규칙 |
| `src/modules/plm/events.ts` | PLM 이벤트 정의 (모듈 간 통신) |
| `src/app/projects/[key]/changes/page.tsx` | 변경 주문 목록 |
| `src/app/projects/[key]/changes/new/page.tsx` | 변경 주문 생성 |
| `src/app/projects/[key]/changes/[id]/page.tsx` | 변경 주문 상세 |
| `src/components/changes/` | 변경 주문 관련 컴포넌트 |
| `src/hooks/useChangeOrder.ts` | 변경 주문 상태 관리 훅 |
| `src/lib/event-bus.ts` | In-process 이벤트 버스 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | change order 스키마 import 추가 |
| `src/server/trpc/router.ts` | change order 라우터 등록 |
| `src/modules/plm/router.ts` | changeOrder sub-router 추가 |
| `src/app/projects/[key]/layout.tsx` | 변경 주문 네비게이션 추가 |

---

## Testing Strategy

### Unit Tests

- 상태 전이 규칙 검증 (모든 허용/거부 케이스)
- 다중 승인자 승인 로직 (전원 승인, 1명 거부)
- 감사 추적 기록 생성 검증
- 영향 분석 쿼리 로직

### Integration Tests

- 변경 주문 생성 → 제출 → 검토 → 승인 전체 플로우
- 변경 주문 거부 → 수정 → 재제출 플로우
- 승인 후 구현 완료 플로우
- 감사 추적 기록 무결성 검증

### E2E Tests

- 변경 주문 생성 → 제출 → 승인자 검토 → 승인 전체 UI 플로우
- 변경 주문 거부 → 수정 → 재제출 UI 플로우
- 감사 추적 타임라인 표시 확인
