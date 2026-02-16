# SPEC-PLM-004: 이슈 추적 코어

## Metadata

- ID: SPEC-PLM-004
- Status: Draft
- Priority: P1
- Size: L
- Dependencies: SPEC-PLM-003
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

프로젝트 내 이슈 생성, 조회, 수정, 삭제와 상태 워크플로우를 구현합니다.
이슈 코멘트, 라벨, 마일스톤, 필터/검색, 칸반 보드를 포함하며,
커서 기반 페이지네이션으로 대량 데이터를 처리합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: **WHEN** 프로젝트 멤버가 이슈 생성 요청을 보내면 **THEN** 시스템은 프로젝트 키 기반 순차 번호(예: PLM-1, PLM-2)를 부여하여 이슈를 생성해야 한다
- FR-002: **WHEN** 사용자가 이슈 목록을 요청하면 **THEN** 시스템은 커서 기반 페이지네이션으로 이슈를 반환해야 한다
- FR-003: **WHEN** 이슈 상태 변경 요청이 접수되면 **THEN** 시스템은 허용된 상태 전이에 따라 상태를 변경해야 한다
- FR-004: **IF** 허용되지 않은 상태 전이가 요청되면 **THEN** 시스템은 에러를 반환해야 한다
- FR-005: **WHEN** 이슈에 코멘트 작성 요청이 접수되면 **THEN** 시스템은 코멘트를 저장하고 작성자와 시간을 기록해야 한다
- FR-006: **WHEN** 사용자가 라벨을 생성/수정/삭제하면 **THEN** 시스템은 프로젝트 범위의 라벨을 관리해야 한다
- FR-007: **WHEN** 이슈에 라벨을 할당하면 **THEN** 시스템은 이슈-라벨 관계를 저장해야 한다
- FR-008: **WHEN** 사용자가 마일스톤을 생성하면 **THEN** 시스템은 이름, 설명, 마감일을 포함한 마일스톤을 저장해야 한다
- FR-009: **WHEN** 칸반 보드에서 이슈를 드래그 앤 드롭하면 **THEN** 시스템은 이슈 상태를 해당 컬럼의 상태로 변경해야 한다
- FR-010: **WHEN** 사용자가 이슈를 필터링하면 **THEN** 시스템은 상태, 담당자, 라벨, 마일스톤, 우선순위 기준으로 필터링된 결과를 반환해야 한다
- FR-011: **WHEN** 이슈에 담당자를 할당하면 **THEN** 시스템은 프로젝트 멤버만 담당자로 허용해야 한다
- FR-012: 시스템은 이슈 우선순위를 **항상** urgent, high, medium, low, none 5단계로 구분해야 한다
- FR-013: 시스템은 이슈 유형을 **항상** task, bug, feature, improvement 4가지로 구분해야 한다

### Non-Functional Requirements

- NFR-001: 이슈 목록 조회 응답 시간은 200ms 이내여야 한다
- NFR-002: 커서 기반 페이지네이션은 한 페이지당 최대 50건을 반환해야 한다
- NFR-003: 칸반 보드 드래그 앤 드롭은 낙관적 업데이트로 즉시 UI를 반영해야 한다

---

## User Stories

- US-001: 프로젝트 멤버로서, 이슈를 생성할 수 있어야 한다, 그래야 작업을 추적할 수 있다
- US-002: 프로젝트 멤버로서, 이슈 목록을 필터링/검색할 수 있어야 한다, 그래야 필요한 이슈를 빠르게 찾을 수 있다
- US-003: 프로젝트 멤버로서, 이슈 상태를 변경할 수 있어야 한다, 그래야 작업 진행 상황을 반영할 수 있다
- US-004: 프로젝트 멤버로서, 이슈에 코멘트를 남길 수 있어야 한다, 그래야 팀과 소통할 수 있다
- US-005: 프로젝트 관리자로서, 라벨과 마일스톤을 관리할 수 있어야 한다, 그래야 이슈를 분류하고 일정을 관리할 수 있다
- US-006: 프로젝트 멤버로서, 칸반 보드에서 이슈를 관리할 수 있어야 한다, 그래야 시각적으로 작업 흐름을 파악할 수 있다

---

## Acceptance Criteria

- AC-001: Given 프로젝트 멤버가, When 이슈를 생성하면, Then 프로젝트 키 기반 순차 번호가 부여된다 (예: PLM-1)
- AC-002: Given 100개 이슈가 있을 때, When 이슈 목록을 조회하면, Then 커서 기반 페이지네이션으로 최대 50건씩 반환된다
- AC-003: Given 이슈 상태가 open일 때, When in_progress로 변경하면, Then 상태가 업데이트된다
- AC-004: Given 이슈 상태가 open일 때, When done으로 직접 변경하려 하면, Then 허용되지 않은 전이 에러가 반환된다
- AC-005: Given 이슈에 코멘트를 작성하면, When 이슈 상세를 조회하면, Then 코멘트 목록에 표시된다
- AC-006: Given 라벨이 생성되었을 때, When 이슈에 라벨을 할당하면, Then 이슈 목록에서 라벨 필터링이 동작한다
- AC-007: Given 마일스톤이 생성되었을 때, When 이슈에 마일스톤을 할당하면, Then 마일스톤별 이슈 그룹핑이 동작한다
- AC-008: Given 칸반 보드에서, When 이슈를 다른 컬럼으로 드래그하면, Then 이슈 상태가 즉시 변경되고 UI가 업데이트된다
- AC-009: Given 이슈에 담당자를 할당할 때, When 프로젝트 비멤버를 지정하면, Then 에러가 반환된다
- AC-010: Given 필터가 설정되었을 때, When "상태: open, 담당자: 나"로 필터링하면, Then 해당 조건의 이슈만 반환된다

---

## Technical Design

### Module: issue

### Database Tables

**issues**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| number | integer | NOT NULL (프로젝트 내 순차) |
| title | varchar(500) | NOT NULL |
| description | text | nullable |
| status | enum('open','in_progress','review','done','closed') | NOT NULL, default 'open' |
| priority | enum('urgent','high','medium','low','none') | NOT NULL, default 'none' |
| type | enum('task','bug','feature','improvement') | NOT NULL, default 'task' |
| assignee_id | uuid | FK -> users.id, nullable |
| reporter_id | uuid | FK -> users.id, NOT NULL |
| milestone_id | uuid | FK -> milestones.id, nullable |
| parent_id | uuid | FK -> issues.id, nullable (서브태스크) |
| position | integer | NOT NULL, default 0 (칸반 정렬) |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |
| UNIQUE(project_id, number) | | |

**issue_comments**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| issue_id | uuid | FK -> issues.id, NOT NULL |
| author_id | uuid | FK -> users.id, NOT NULL |
| content | text | NOT NULL |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

**labels**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| name | varchar(50) | NOT NULL |
| color | varchar(7) | NOT NULL (hex color) |
| description | varchar(255) | nullable |
| UNIQUE(project_id, name) | | |

**issue_labels** (M:N 중간 테이블)
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| issue_id | uuid | FK -> issues.id, NOT NULL |
| label_id | uuid | FK -> labels.id, NOT NULL |
| PK(issue_id, label_id) | | |

**milestones**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| title | varchar(255) | NOT NULL |
| description | text | nullable |
| due_date | date | nullable |
| status | enum('open','closed') | NOT NULL, default 'open' |
| created_at | timestamp | NOT NULL |

### 상태 전이 규칙

```
open -> in_progress, closed
in_progress -> review, open, closed
review -> done, in_progress, closed
done -> closed, open (reopen)
closed -> open (reopen)
```

### tRPC Procedures

```
issue.router
├── create             # mutation: 이슈 생성 (자동 번호 부여)
├── list               # query: 이슈 목록 (커서 페이지네이션, 필터)
├── getById            # query: 이슈 상세 조회
├── getByNumber        # query: 프로젝트 키+번호로 조회 (PLM-1)
├── update             # mutation: 이슈 수정
├── updateStatus       # mutation: 상태 변경 (전이 규칙 검증)
├── updatePosition     # mutation: 칸반 위치 변경
├── delete             # mutation: 이슈 삭제 (admin+)
├── comment
│   ├── create         # mutation: 코멘트 작성
│   ├── update         # mutation: 코멘트 수정 (작성자)
│   ├── delete         # mutation: 코멘트 삭제 (작성자/admin)
│   └── list           # query: 코멘트 목록
├── label
│   ├── create         # mutation: 라벨 생성 (admin+)
│   ├── update         # mutation: 라벨 수정
│   ├── delete         # mutation: 라벨 삭제
│   ├── list           # query: 프로젝트 라벨 목록
│   ├── assign         # mutation: 이슈에 라벨 할당
│   └── unassign       # mutation: 이슈에서 라벨 제거
└── milestone
    ├── create         # mutation: 마일스톤 생성 (admin+)
    ├── update         # mutation: 마일스톤 수정
    ├── close          # mutation: 마일스톤 닫기
    └── list           # query: 프로젝트 마일스톤 목록
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/projects/[key]/issues` | 이슈 목록 (리스트 뷰) | Protected (멤버) |
| `/projects/[key]/issues/new` | 이슈 생성 | Protected (멤버) |
| `/projects/[key]/issues/[number]` | 이슈 상세 | Protected (멤버) |
| `/projects/[key]/board` | 칸반 보드 | Protected (멤버) |
| `/projects/[key]/milestones` | 마일스톤 목록 | Protected (멤버) |
| `/projects/[key]/labels` | 라벨 관리 | Protected (admin+) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `IssueList` | 이슈 목록 테이블 (필터, 정렬, 페이지네이션) |
| `IssueCreateForm` | 이슈 생성/수정 폼 |
| `IssueDetail` | 이슈 상세 뷰 (본문, 사이드바, 코멘트) |
| `IssueStatusBadge` | 이슈 상태 배지 (색상 코드) |
| `IssuePriorityIcon` | 우선순위 아이콘 |
| `IssueTypeIcon` | 이슈 유형 아이콘 |
| `CommentList` | 코멘트 목록 |
| `CommentForm` | 코멘트 입력 폼 |
| `KanbanBoard` | 칸반 보드 (dnd-kit) |
| `KanbanColumn` | 칸반 컬럼 (상태별) |
| `KanbanCard` | 칸반 카드 (이슈 요약) |
| `IssueFilterBar` | 필터 바 (상태, 담당자, 라벨, 마일스톤) |
| `LabelBadge` | 라벨 배지 (색상) |
| `MilestoneProgress` | 마일스톤 진행률 바 |
| `AssigneeSelect` | 담당자 선택 드롭다운 |

---

## Edge Cases & Risks

- EC-001: 대량 이슈 처리 - 커서 기반 페이지네이션으로 성능 보장, 인덱스 최적화
- EC-002: 동시 편집 - 낙관적 업데이트 + 최종 업데이트 승리(last-write-wins) 전략
- EC-003: 이슈 번호 동시 생성 - DB 시퀀스 또는 트랜잭션 내 MAX+1로 원자적 번호 부여
- EC-004: 빈 마일스톤 - 이슈 없는 마일스톤 표시 허용, 0% 진행률로 표시
- EC-005: 부모-자식 이슈 - parent_id로 서브태스크 지원, MVP에서는 1단계만
- EC-006: 칸반 보드 위치 충돌 - position 필드로 정렬, drag 시 reorder 로직
- RISK-001: 이슈 번호 중복 -> UNIQUE(project_id, number) 제약조건 + 트랜잭션 (영향: 높음)
- RISK-002: 칸반 드래그 성능 -> 낙관적 업데이트 + batch position 업데이트 (영향: 중간)
- RISK-003: 필터 조합 폭발 -> 인덱스 최적화 + 쿼리 플래닝 (영향: 중간)

---

## Files to Create/Modify

### 신규 생성 파일 (~18개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/issue/schemas/issues.ts` | issues 테이블 스키마 |
| `src/modules/issue/schemas/issue-comments.ts` | issue_comments 테이블 스키마 |
| `src/modules/issue/schemas/labels.ts` | labels 테이블 스키마 |
| `src/modules/issue/schemas/issue-labels.ts` | issue_labels 중간 테이블 스키마 |
| `src/modules/issue/schemas/milestones.ts` | milestones 테이블 스키마 |
| `src/modules/issue/router.ts` | issue tRPC 라우터 |
| `src/modules/issue/service.ts` | issue 비즈니스 로직 |
| `src/modules/issue/types.ts` | issue 타입 정의 |
| `src/modules/issue/status-machine.ts` | 상태 전이 규칙 |
| `src/app/projects/[key]/issues/page.tsx` | 이슈 목록 |
| `src/app/projects/[key]/issues/new/page.tsx` | 이슈 생성 |
| `src/app/projects/[key]/issues/[number]/page.tsx` | 이슈 상세 |
| `src/app/projects/[key]/board/page.tsx` | 칸반 보드 |
| `src/app/projects/[key]/milestones/page.tsx` | 마일스톤 |
| `src/app/projects/[key]/labels/page.tsx` | 라벨 관리 |
| `src/components/issues/` | 이슈 관련 컴포넌트 |
| `src/components/kanban/` | 칸반 보드 컴포넌트 |
| `src/hooks/useIssueFilters.ts` | 이슈 필터 훅 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | issue 스키마 import 추가 |
| `src/server/trpc/router.ts` | issue 라우터 등록 |
| `src/app/projects/[key]/layout.tsx` | 이슈/보드 네비게이션 추가 |

---

## Testing Strategy

### Unit Tests

- 상태 전이 규칙 검증 (허용/거부)
- 이슈 번호 자동 부여 로직
- 필터 쿼리 빌더 로직
- Zod 입력 스키마 검증

### Integration Tests

- 이슈 CRUD 전체 플로우
- 상태 전이 워크플로우
- 코멘트 CRUD
- 라벨 할당/해제
- 마일스톤 생성 및 이슈 연결
- 커서 기반 페이지네이션 동작

### E2E Tests

- 이슈 생성 → 상태 변경 → 코멘트 → 완료 전체 플로우
- 칸반 보드 드래그 앤 드롭
- 이슈 필터링/검색
