# SPEC-PLM-005: BOM 및 부품 관리 (PLM)

## Metadata

- ID: SPEC-PLM-005
- Status: Draft
- Priority: P2
- Size: L
- Dependencies: SPEC-PLM-003
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

PLM(Product Lifecycle Management)의 핵심인 부품(Part) 관리, BOM(Bill of Materials) 트리 관리,
리비전 이력 관리를 구현합니다. 부품 번호 체계, 재귀적 BOM 트리 렌더링,
리비전 기반 변경 추적, Where-Used 쿼리를 포함합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: **WHEN** 사용자가 부품 생성 요청을 보내면 **THEN** 시스템은 고유한 부품 번호(Part Number)와 함께 부품을 생성해야 한다
- FR-002: **WHEN** 부품이 생성되면 **THEN** 시스템은 자동으로 Rev A (초기 리비전)를 생성해야 한다
- FR-003: **WHEN** 사용자가 부품 수정 요청을 보내면 **THEN** 시스템은 새로운 리비전을 생성하고 변경 내용을 기록해야 한다
- FR-004: **WHEN** 사용자가 BOM 아이템을 추가하면 **THEN** 시스템은 부모 부품 하위에 자식 부품과 수량을 기록해야 한다
- FR-005: **IF** BOM 추가 시 순환 참조가 발생하면 **THEN** 시스템은 에러를 반환하고 추가를 거부해야 한다
- FR-006: **WHEN** 사용자가 BOM 트리를 조회하면 **THEN** 시스템은 재귀적으로 모든 레벨의 부품을 트리 구조로 반환해야 한다
- FR-007: **WHEN** 사용자가 Where-Used 쿼리를 실행하면 **THEN** 시스템은 해당 부품이 사용된 모든 상위 BOM을 반환해야 한다
- FR-008: **WHEN** 사용자가 부품의 리비전 이력을 조회하면 **THEN** 시스템은 모든 리비전을 시간순으로 반환해야 한다
- FR-009: **가능하면** BOM을 CSV/Excel 형식으로 내보내기 기능을 제공한다
- FR-010: 시스템은 부품 상태를 **항상** draft, active, obsolete 3단계로 구분해야 한다
- FR-011: **WHEN** 사용자가 부품 목록을 검색하면 **THEN** 시스템은 부품 번호, 이름, 설명 기준으로 검색 결과를 반환해야 한다

### Non-Functional Requirements

- NFR-001: BOM 트리 조회는 10단계 깊이까지 2초 이내에 렌더링되어야 한다
- NFR-002: 부품 번호는 프로젝트별로 고유해야 한다
- NFR-003: 리비전 이력은 삭제 불가하며 영구 보존되어야 한다

---

## User Stories

- US-001: 엔지니어로서, 부품을 생성하고 부품 번호를 부여할 수 있어야 한다, 그래야 제품 구성을 관리할 수 있다
- US-002: 엔지니어로서, BOM 트리를 구성할 수 있어야 한다, 그래야 제품의 부품 구조를 정의할 수 있다
- US-003: 엔지니어로서, 부품을 수정하면 새 리비전이 생성되어야 한다, 그래야 변경 이력을 추적할 수 있다
- US-004: 엔지니어로서, 특정 부품이 어디에 사용되는지 확인할 수 있어야 한다, 그래야 변경 영향을 분석할 수 있다
- US-005: 프로젝트 관리자로서, BOM을 내보낼 수 있어야 한다, 그래야 외부 시스템과 데이터를 공유할 수 있다

---

## Acceptance Criteria

- AC-001: Given 사용자가 부품을 생성할 때, When 유효한 부품 번호와 이름을 입력하면, Then 부품과 초기 리비전(Rev A)이 생성된다
- AC-002: Given 이미 존재하는 부품 번호로, When 부품을 생성하려 하면, Then "이미 사용 중인 부품 번호입니다" 에러가 반환된다
- AC-003: Given 부품을 수정할 때, When 변경 내용을 저장하면, Then 새 리비전(Rev B, C...)이 생성되고 이전 리비전은 보존된다
- AC-004: Given BOM 트리에 자식 부품을 추가할 때, When 순환 참조가 발생하면, Then 에러가 반환되고 추가가 거부된다
- AC-005: Given 5단계 깊이의 BOM 트리가 있을 때, When 트리를 조회하면, Then 모든 레벨이 재귀적으로 표시된다
- AC-006: Given 부품 A가 BOM-1, BOM-2에 사용될 때, When Where-Used를 실행하면, Then BOM-1, BOM-2가 반환된다
- AC-007: Given 부품의 리비전 이력을 조회할 때, When Rev A, B, C가 존재하면, Then 시간순으로 모든 리비전이 표시된다
- AC-008: Given BOM 데이터가 있을 때, When CSV 내보내기를 실행하면, Then 부품 번호, 이름, 수량이 포함된 CSV 파일이 다운로드된다
- AC-009: Given 10단계 깊이의 BOM 트리가 있을 때, When 트리를 조회하면, Then 2초 이내에 렌더링된다

---

## Technical Design

### Module: plm

### Database Tables

**parts**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| part_number | varchar(50) | NOT NULL |
| name | varchar(255) | NOT NULL |
| description | text | nullable |
| category | varchar(100) | nullable |
| status | enum('draft','active','obsolete') | NOT NULL, default 'draft' |
| current_revision_id | uuid | FK -> revisions.id, nullable |
| created_by | uuid | FK -> users.id, NOT NULL |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |
| UNIQUE(project_id, part_number) | | |

**revisions**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| part_id | uuid | FK -> parts.id, NOT NULL |
| revision_code | varchar(10) | NOT NULL (A, B, C...) |
| description | text | nullable (변경 사유) |
| changes | jsonb | nullable (변경 상세) |
| created_by | uuid | FK -> users.id, NOT NULL |
| created_at | timestamp | NOT NULL |
| UNIQUE(part_id, revision_code) | | |

**bom_items**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| parent_part_id | uuid | FK -> parts.id, NOT NULL |
| child_part_id | uuid | FK -> parts.id, NOT NULL |
| quantity | decimal(10,2) | NOT NULL, default 1 |
| unit | varchar(20) | NOT NULL, default 'EA' |
| position | integer | NOT NULL (정렬 순서) |
| notes | text | nullable |
| created_at | timestamp | NOT NULL |
| UNIQUE(parent_part_id, child_part_id) | | |
| CHECK(parent_part_id != child_part_id) | | |

### tRPC Procedures

```
plm.router
├── part
│   ├── create         # mutation: 부품 생성 (자동 Rev A)
│   ├── list           # query: 부품 목록 (검색, 필터, 페이지네이션)
│   ├── getById        # query: 부품 상세 (현재 리비전 포함)
│   ├── update         # mutation: 부품 수정 (새 리비전 생성)
│   ├── updateStatus   # mutation: 부품 상태 변경
│   ├── search         # query: 부품 검색 (번호/이름/설명)
│   └── whereUsed      # query: Where-Used 쿼리
├── revision
│   ├── list           # query: 부품 리비전 이력
│   └── getById        # query: 특정 리비전 상세
├── bom
│   ├── addItem        # mutation: BOM 아이템 추가 (순환 참조 검사)
│   ├── removeItem     # mutation: BOM 아이템 제거
│   ├── updateItem     # mutation: BOM 아이템 수정 (수량 등)
│   ├── getTree        # query: BOM 트리 조회 (재귀)
│   ├── getFlatList    # query: BOM 평면 목록 (모든 레벨)
│   └── export         # query: BOM 내보내기 (CSV 형식)
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/projects/[key]/parts` | 부품 목록 | Protected (멤버) |
| `/projects/[key]/parts/new` | 부품 생성 | Protected (멤버) |
| `/projects/[key]/parts/[id]` | 부품 상세 (BOM, 리비전) | Protected (멤버) |
| `/projects/[key]/parts/[id]/bom` | BOM 트리 뷰 | Protected (멤버) |
| `/projects/[key]/parts/[id]/revisions` | 리비전 이력 | Protected (멤버) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `PartList` | 부품 목록 테이블 (검색, 필터) |
| `PartCreateForm` | 부품 생성/수정 폼 |
| `PartDetail` | 부품 상세 뷰 |
| `PartStatusBadge` | 부품 상태 배지 |
| `BomTree` | 재귀적 BOM 트리 컴포넌트 |
| `BomTreeNode` | BOM 트리 노드 (확장/축소) |
| `BomAddItemDialog` | BOM 아이템 추가 다이얼로그 |
| `BomFlatTable` | BOM 평면 목록 테이블 |
| `RevisionTimeline` | 리비전 타임라인 |
| `RevisionDetail` | 리비전 상세 (변경 내용) |
| `WhereUsedTable` | Where-Used 결과 테이블 |
| `PartSearchInput` | 부품 검색 입력 (자동완성) |

---

## Edge Cases & Risks

- EC-001: 깊은 BOM 중첩 (10+ 레벨) - 재귀 CTE 쿼리로 처리, 최대 깊이 제한(20레벨) 설정
- EC-002: 순환 참조 방지 - BOM 추가 시 DFS로 순환 검사 후 추가
- EC-003: 부품 재사용 (여러 BOM에서 동일 부품 사용) - bom_items의 child_part_id는 여러 parent에 할당 가능
- EC-004: 고아 부품 - 어떤 BOM에도 속하지 않는 부품 허용, 필터링으로 관리
- EC-005: 리비전 코드 체계 - A-Z 순차 부여, Z 이후 AA, AB... 로 확장
- EC-006: 대량 BOM 내보내기 - 스트리밍 CSV 생성으로 메모리 최적화
- RISK-001: 재귀 CTE 성능 -> 깊이 제한 + 인덱스 최적화 (영향: 높음)
- RISK-002: 순환 참조 검사 성능 -> 캐시된 그래프 구조 사용 (영향: 중간)
- RISK-003: 리비전 데이터 증가 -> 영구 보존 정책이므로 아카이빙 전략 필요 (영향: 낮음)

---

## Files to Create/Modify

### 신규 생성 파일 (~14개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/plm/schemas/parts.ts` | parts 테이블 스키마 |
| `src/modules/plm/schemas/revisions.ts` | revisions 테이블 스키마 |
| `src/modules/plm/schemas/bom-items.ts` | bom_items 테이블 스키마 |
| `src/modules/plm/router.ts` | plm tRPC 라우터 |
| `src/modules/plm/service.ts` | plm 비즈니스 로직 |
| `src/modules/plm/types.ts` | plm 타입 정의 |
| `src/modules/plm/bom-utils.ts` | BOM 순환 참조 검사, 트리 빌더 |
| `src/modules/plm/revision-utils.ts` | 리비전 코드 생성기 |
| `src/app/projects/[key]/parts/page.tsx` | 부품 목록 |
| `src/app/projects/[key]/parts/new/page.tsx` | 부품 생성 |
| `src/app/projects/[key]/parts/[id]/page.tsx` | 부품 상세 |
| `src/components/plm/` | PLM 관련 컴포넌트 |
| `src/hooks/useBomTree.ts` | BOM 트리 상태 관리 훅 |
| `src/hooks/usePartSearch.ts` | 부품 검색 훅 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | plm 스키마 import 추가 |
| `src/server/trpc/router.ts` | plm 라우터 등록 |
| `src/app/projects/[key]/layout.tsx` | 부품/BOM 네비게이션 추가 |

---

## Testing Strategy

### Unit Tests

- 순환 참조 검사 로직 (다양한 그래프 구조)
- 리비전 코드 생성기 (A->B->...->Z->AA)
- BOM 트리 빌더 (flat list -> tree 변환)
- 부품 번호 유효성 검증

### Integration Tests

- 부품 생성 → 리비전 자동 생성 확인
- BOM 아이템 추가 → 순환 참조 거부 확인
- BOM 트리 조회 (다단계 중첩)
- Where-Used 쿼리 결과 검증
- BOM CSV 내보내기

### E2E Tests

- 부품 생성 → BOM 구성 → 트리 뷰 확인 전체 플로우
- 부품 수정 → 새 리비전 생성 → 리비전 이력 확인
- Where-Used 조회 → 결과 확인
