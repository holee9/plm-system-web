# SPEC-PLM-003: 프로젝트 CRUD 및 관리

## Metadata

- ID: SPEC-PLM-003
- Status: Draft
- Priority: P1
- Size: M
- Dependencies: SPEC-PLM-002
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

프로젝트 생성, 조회, 수정, 아카이브 기능과 프로젝트 멤버 관리를 구현합니다.
프로젝트는 이슈, BOM, 변경 주문 등 모든 기능의 상위 컨텍스트이며,
프로젝트별 데이터 격리와 멤버 역할 기반 접근 제어를 제공합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: **WHEN** 인증된 사용자가 프로젝트 생성 요청을 보내면 **THEN** 시스템은 고유한 프로젝트 키와 함께 프로젝트를 생성해야 한다
- FR-002: **WHEN** 프로젝트 키가 중복되면 **THEN** 시스템은 유효성 검증 에러를 반환해야 한다
- FR-003: **WHEN** 사용자가 프로젝트 목록을 요청하면 **THEN** 시스템은 해당 사용자가 멤버인 프로젝트만 반환해야 한다
- FR-004: **WHEN** 프로젝트 admin 이상이 프로젝트 정보 수정을 요청하면 **THEN** 시스템은 이름, 설명, 설정을 업데이트해야 한다
- FR-005: **WHEN** 프로젝트 admin 이상이 아카이브 요청을 보내면 **THEN** 시스템은 프로젝트를 아카이브 상태로 변경해야 한다 (데이터 유지)
- FR-006: **WHEN** 프로젝트 admin 이상이 멤버 추가 요청을 보내면 **THEN** 시스템은 해당 사용자를 지정된 역할로 프로젝트에 추가해야 한다
- FR-007: **IF** 사용자가 프로젝트 멤버가 아니면 **THEN** 시스템은 해당 프로젝트 데이터에 대한 접근을 거부해야 한다
- FR-008: 시스템은 프로젝트 멤버에 대해 **항상** admin, member, viewer 3가지 역할을 구분해야 한다
- FR-009: **WHEN** 프로젝트 상세 페이지에 접근하면 **THEN** 시스템은 프로젝트 정보, 멤버 목록, 최근 활동을 표시해야 한다

### Non-Functional Requirements

- NFR-001: 프로젝트 목록 조회 응답 시간은 200ms 이내여야 한다
- NFR-002: 프로젝트 키는 영문 대문자 + 숫자, 2~10자로 제한되어야 한다 (예: PLM, PROJ01)
- NFR-003: 시스템은 **항상** 프로젝트별 데이터 격리를 보장해야 한다

---

## User Stories

- US-001: 프로젝트 관리자로서, 새 프로젝트를 생성할 수 있어야 한다, 그래야 업무를 조직화할 수 있다
- US-002: 팀 멤버로서, 내가 속한 프로젝트 목록을 볼 수 있어야 한다, 그래야 작업할 프로젝트를 선택할 수 있다
- US-003: 프로젝트 관리자로서, 프로젝트 정보를 수정할 수 있어야 한다, 그래야 프로젝트 설정을 관리할 수 있다
- US-004: 프로젝트 관리자로서, 완료된 프로젝트를 아카이브할 수 있어야 한다, 그래야 활성 프로젝트에 집중할 수 있다
- US-005: 프로젝트 관리자로서, 멤버를 추가하고 역할을 지정할 수 있어야 한다, 그래야 프로젝트 접근 권한을 관리할 수 있다

---

## Acceptance Criteria

- AC-001: Given 인증된 사용자가, When 유효한 이름/키/설명으로 프로젝트를 생성하면, Then 프로젝트가 생성되고 요청자가 admin으로 등록된다
- AC-002: Given 이미 존재하는 프로젝트 키로, When 프로젝트를 생성하려 하면, Then "이미 사용 중인 프로젝트 키입니다" 에러가 반환된다
- AC-003: Given 3개 프로젝트에 속한 사용자가, When 프로젝트 목록을 조회하면, Then 3개 프로젝트만 반환된다 (다른 프로젝트 제외)
- AC-004: Given 프로젝트 admin이, When 프로젝트 이름을 변경하면, Then 변경된 이름이 저장된다
- AC-005: Given 프로젝트 viewer가, When 프로젝트 수정을 시도하면, Then 권한 부족 에러가 반환된다
- AC-006: Given 프로젝트 admin이, When 프로젝트를 아카이브하면, Then 프로젝트 상태가 archived로 변경되고 목록에서 기본 필터링된다
- AC-007: Given 프로젝트 admin이, When 새 멤버를 viewer 역할로 추가하면, Then 해당 사용자가 프로젝트에 viewer로 등록된다
- AC-008: Given 프로젝트 비멤버가, When 프로젝트 데이터에 접근하면, Then 403 응답이 반환된다

---

## Technical Design

### Module: project

### Database Tables

**projects**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK, default gen_random_uuid() |
| name | varchar(255) | NOT NULL |
| key | varchar(10) | UNIQUE, NOT NULL |
| description | text | nullable |
| status | enum('active','archived') | NOT NULL, default 'active' |
| team_id | uuid | FK -> teams.id, nullable |
| created_by | uuid | FK -> users.id, NOT NULL |
| created_at | timestamp | NOT NULL, default now() |
| updated_at | timestamp | NOT NULL, default now() |

**project_members**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| user_id | uuid | FK -> users.id, NOT NULL |
| role | enum('admin','member','viewer') | NOT NULL, default 'member' |
| joined_at | timestamp | NOT NULL |
| UNIQUE(project_id, user_id) | | |

### tRPC Procedures

```
project.router
├── create             # mutation: 프로젝트 생성
├── list               # query: 내 프로젝트 목록 (페이지네이션)
├── getById            # query: 프로젝트 상세 조회
├── getByKey           # query: 프로젝트 키로 조회
├── update             # mutation: 프로젝트 수정 (admin+)
├── archive            # mutation: 프로젝트 아카이브 (admin+)
├── restore            # mutation: 아카이브 복원 (admin+)
├── addMember          # mutation: 멤버 추가 (admin+)
├── removeMember       # mutation: 멤버 제거 (admin+)
├── updateMemberRole   # mutation: 멤버 역할 변경 (admin+)
└── listMembers        # query: 프로젝트 멤버 목록
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/projects` | 프로젝트 목록 | Protected |
| `/projects/new` | 프로젝트 생성 | Protected |
| `/projects/[key]` | 프로젝트 대시보드 | Protected (멤버) |
| `/projects/[key]/settings` | 프로젝트 설정 | Protected (admin+) |
| `/projects/[key]/members` | 멤버 관리 | Protected (admin+) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `ProjectCard` | 프로젝트 목록 카드 |
| `ProjectCreateForm` | 프로젝트 생성 폼 |
| `ProjectSettingsForm` | 프로젝트 설정 폼 |
| `ProjectMemberList` | 프로젝트 멤버 목록 |
| `AddMemberDialog` | 멤버 추가 다이얼로그 |
| `ProjectSidebar` | 프로젝트 내 사이드바 네비게이션 |
| `ProjectKeyInput` | 프로젝트 키 입력 (자동 대문자, 중복 검사) |

---

## Edge Cases & Risks

- EC-001: 중복 프로젝트 키 - 실시간 중복 검사 (debounce), 서버 측 UNIQUE 제약조건으로 이중 보호
- EC-002: Cascading Delete - 프로젝트 삭제 대신 아카이브 사용, 하위 데이터(이슈, BOM 등) 보존
- EC-003: 고아 데이터 - 프로젝트 멤버 제거 시 해당 멤버의 할당된 이슈는 미할당으로 변경
- EC-004: 빈 프로젝트 상태 - 이슈/BOM 없는 신규 프로젝트에 대한 Empty State UI 제공
- EC-005: 프로젝트 키 변경 - MVP에서는 키 변경 불가 (URL 라우팅 기반)
- RISK-001: 프로젝트별 데이터 격리 누락 -> 모든 쿼리에 project_id 필터 필수 적용 (영향: 높음)
- RISK-002: 멤버 역할 권한 우회 -> tRPC middleware에서 역할 검증 필수 (영향: 높음)

---

## Files to Create/Modify

### 신규 생성 파일 (~12개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/project/schemas/projects.ts` | projects 테이블 스키마 |
| `src/modules/project/schemas/project-members.ts` | project_members 테이블 스키마 |
| `src/modules/project/router.ts` | project tRPC 라우터 |
| `src/modules/project/service.ts` | project 비즈니스 로직 |
| `src/modules/project/types.ts` | project 타입 정의 |
| `src/app/projects/page.tsx` | 프로젝트 목록 페이지 |
| `src/app/projects/new/page.tsx` | 프로젝트 생성 페이지 |
| `src/app/projects/[key]/page.tsx` | 프로젝트 대시보드 |
| `src/app/projects/[key]/settings/page.tsx` | 프로젝트 설정 |
| `src/app/projects/[key]/members/page.tsx` | 멤버 관리 |
| `src/app/projects/[key]/layout.tsx` | 프로젝트 레이아웃 (사이드바) |
| `src/components/projects/` | 프로젝트 관련 컴포넌트 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | project 스키마 import 추가 |
| `src/server/trpc/router.ts` | project 라우터 등록 |

---

## Testing Strategy

### Unit Tests

- 프로젝트 키 유효성 검증 (형식, 길이)
- 역할 기반 권한 체크 로직
- Zod 입력 스키마 검증

### Integration Tests

- 프로젝트 생성 → 조회 → 수정 → 아카이브 플로우
- 멤버 추가 → 역할 변경 → 멤버 제거 플로우
- 프로젝트별 데이터 격리 검증 (멤버가 아닌 프로젝트 접근 불가)

### E2E Tests

- 프로젝트 생성 → 설정 변경 → 멤버 관리 전체 UI 플로우
- 프로젝트 목록 → 프로젝트 선택 → 대시보드 진입 플로우
