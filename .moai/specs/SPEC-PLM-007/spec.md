# SPEC-PLM-007: 대시보드, 리포팅, 알림, 문서 관리

## Metadata

- ID: SPEC-PLM-007
- Status: Draft
- Priority: P2
- Size: M
- Dependencies: SPEC-PLM-004, SPEC-PLM-006
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

통합 대시보드, 알림 시스템, 파일/문서 관리, 활동 피드를 구현합니다.
대시보드는 프로젝트 통계와 차트를 제공하고, 알림은 SSE 기반 실시간 알림을 지원합니다.
문서 관리는 파일 업로드/다운로드와 버전 관리를 제공합니다.

---

## Requirements (EARS Format)

### Functional Requirements

#### 대시보드

- FR-001: **WHEN** 사용자가 대시보드에 접근하면 **THEN** 시스템은 프로젝트별 통계 카드(이슈 수, 진행률, BOM 수, 변경 주문 수)를 표시해야 한다
- FR-002: **WHEN** 사용자가 대시보드에 접근하면 **THEN** 시스템은 이슈 상태 분포 차트, 우선순위 분포 차트를 표시해야 한다
- FR-003: **WHEN** 사용자가 프로젝트를 선택하면 **THEN** 시스템은 해당 프로젝트의 요약 정보(최근 활동, 마일스톤 진행률, 담당 이슈)를 표시해야 한다

#### 알림

- FR-004: **WHEN** 사용자에게 관련된 이벤트가 발생하면 **THEN** 시스템은 알림을 생성하고 실시간으로 전달해야 한다
- FR-005: **WHEN** 사용자가 알림 벨 아이콘을 클릭하면 **THEN** 시스템은 읽지 않은 알림 수와 알림 목록을 표시해야 한다
- FR-006: **WHEN** 사용자가 알림을 클릭하면 **THEN** 시스템은 해당 리소스 페이지로 이동하고 알림을 읽음 처리해야 한다
- FR-007: **WHEN** 사용자가 모두 읽음 처리를 요청하면 **THEN** 시스템은 모든 미읽음 알림을 읽음으로 변경해야 한다

#### 문서/파일 관리

- FR-008: **WHEN** 사용자가 파일을 업로드하면 **THEN** 시스템은 파일을 저장하고 메타데이터(이름, 크기, 타입, 업로더)를 기록해야 한다
- FR-009: **WHEN** 사용자가 파일 다운로드를 요청하면 **THEN** 시스템은 파일을 반환해야 한다
- FR-010: **WHEN** 동일한 문서에 새 버전이 업로드되면 **THEN** 시스템은 새 파일 버전을 생성하고 이전 버전을 보존해야 한다
- FR-011: **WHEN** 이슈, 부품, 변경 주문에 파일을 첨부하면 **THEN** 시스템은 해당 리소스와 문서의 연결을 저장해야 한다

#### 활동 피드

- FR-012: **WHEN** 시스템 내 주요 활동이 발생하면 **THEN** 시스템은 활동 로그를 기록해야 한다
- FR-013: **WHEN** 사용자가 활동 피드를 조회하면 **THEN** 시스템은 최근 활동을 시간순으로 표시해야 한다

### Non-Functional Requirements

- NFR-001: 대시보드 통계 조회 응답 시간은 500ms 이내여야 한다
- NFR-002: 파일 업로드 크기 제한은 50MB여야 한다
- NFR-003: 알림은 SSE(Server-Sent Events) 기반으로 실시간 전달되어야 한다
- NFR-004: 시스템은 알림 과다 생성을 **항상** 방지해야 한다 (동일 이벤트 중복 알림 5분 쿨다운)

---

## User Stories

- US-001: 프로젝트 관리자로서, 대시보드에서 전체 프로젝트 현황을 파악할 수 있어야 한다, 그래야 빠르게 의사결정할 수 있다
- US-002: 팀 멤버로서, 나에게 할당된 이슈와 검토 요청을 알림으로 받을 수 있어야 한다, 그래야 놓치는 작업이 없다
- US-003: 팀 멤버로서, 이슈나 부품에 파일을 첨부할 수 있어야 한다, 그래야 관련 자료를 공유할 수 있다
- US-004: 팀 멤버로서, 프로젝트 활동 피드를 볼 수 있어야 한다, 그래야 팀의 작업 진행 상황을 파악할 수 있다
- US-005: 새 사용자로서, 프로젝트/이슈/알림이 없을 때 적절한 Empty State 안내를 볼 수 있어야 한다, 그래야 시작 방법을 알 수 있다

---

## Acceptance Criteria

### 대시보드

- AC-001: Given 프로젝트에 10개 이슈가 있을 때, When 대시보드에 접근하면, Then 이슈 수 통계 카드에 10이 표시된다
- AC-002: Given 이슈가 다양한 상태에 있을 때, When 대시보드에 접근하면, Then 상태 분포 차트가 표시된다
- AC-003: Given 프로젝트가 없는 신규 사용자가, When 대시보드에 접근하면, Then Empty State 안내가 표시된다

### 알림

- AC-004: Given 사용자에게 이슈가 할당되었을 때, When 알림 벨을 클릭하면, Then 해당 알림이 미읽음 상태로 표시된다
- AC-005: Given 3개 미읽음 알림이 있을 때, When 알림 벨을 확인하면, Then 배지에 3이 표시된다
- AC-006: Given 알림을 클릭했을 때, When 해당 리소스 페이지로 이동하면, Then 알림이 읽음 처리된다
- AC-007: Given SSE 연결이 활성화되었을 때, When 새 알림이 발생하면, Then 페이지 새로고침 없이 실시간으로 표시된다

### 문서/파일 관리

- AC-008: Given 이슈에 파일을 첨부할 때, When 50MB 이하 파일을 업로드하면, Then 파일이 저장되고 이슈에 연결된다
- AC-009: Given 50MB 초과 파일을, When 업로드하려 하면, Then 파일 크기 초과 에러가 표시된다
- AC-010: Given 문서에 새 버전을 업로드할 때, When 업로드가 완료되면, Then 이전 버전이 보존되고 새 버전이 활성화된다
- AC-011: Given 파일이 업로드되었을 때, When 다운로드를 요청하면, Then 파일이 정상 다운로드된다

### 활동 피드

- AC-012: Given 이슈 생성, 상태 변경, 코멘트 등 활동이 발생했을 때, When 활동 피드를 조회하면, Then 최근 활동이 시간순으로 표시된다

---

## Technical Design

### Modules: notification, document, reporting

### Database Tables

**notifications**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, NOT NULL |
| type | varchar(50) | NOT NULL (issue_assigned, comment_added, co_submitted, etc.) |
| title | varchar(255) | NOT NULL |
| message | text | nullable |
| resource_type | varchar(50) | NOT NULL (issue, change_order, part, etc.) |
| resource_id | uuid | NOT NULL |
| project_id | uuid | FK -> projects.id, nullable |
| is_read | boolean | NOT NULL, default false |
| created_at | timestamp | NOT NULL |

**activity_logs**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| user_id | uuid | FK -> users.id, NOT NULL |
| action | varchar(50) | NOT NULL (created, updated, deleted, status_changed, etc.) |
| resource_type | varchar(50) | NOT NULL |
| resource_id | uuid | NOT NULL |
| details | jsonb | nullable (변경 상세) |
| created_at | timestamp | NOT NULL |

**documents**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, NOT NULL |
| name | varchar(255) | NOT NULL |
| description | text | nullable |
| resource_type | varchar(50) | nullable (issue, part, change_order) |
| resource_id | uuid | nullable |
| current_version_id | uuid | FK -> file_versions.id, nullable |
| created_by | uuid | FK -> users.id, NOT NULL |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

**file_versions**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| document_id | uuid | FK -> documents.id, NOT NULL |
| version_number | integer | NOT NULL |
| file_path | text | NOT NULL (로컬 FS 또는 R2 경로) |
| file_size | bigint | NOT NULL |
| mime_type | varchar(100) | NOT NULL |
| uploaded_by | uuid | FK -> users.id, NOT NULL |
| created_at | timestamp | NOT NULL |
| UNIQUE(document_id, version_number) | | |

### tRPC Procedures

```
notification.router
├── list               # query: 알림 목록 (페이지네이션)
├── unreadCount        # query: 미읽음 수
├── markAsRead         # mutation: 알림 읽음 처리
├── markAllAsRead      # mutation: 전체 읽음 처리
└── delete             # mutation: 알림 삭제

activity.router
├── list               # query: 활동 피드 (프로젝트별, 페이지네이션)
└── getByResource      # query: 특정 리소스의 활동 이력

document.router
├── upload             # mutation: 파일 업로드
├── download           # query: 파일 다운로드 URL
├── list               # query: 문서 목록 (프로젝트별 또는 리소스별)
├── getById            # query: 문서 상세
├── uploadVersion      # mutation: 새 버전 업로드
├── listVersions       # query: 문서 버전 이력
├── delete             # mutation: 문서 삭제
└── linkToResource     # mutation: 리소스에 문서 연결

reporting.router
├── projectStats       # query: 프로젝트 통계 (이슈 수, BOM 수, CO 수)
├── issueDistribution  # query: 이슈 상태/우선순위 분포
├── milestoneProgress  # query: 마일스톤 진행률
├── myAssigned         # query: 내가 할당된 이슈/CO
└── recentActivity     # query: 최근 활동 요약
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/dashboard` | 메인 대시보드 | Protected |
| `/projects/[key]/dashboard` | 프로젝트 대시보드 | Protected (멤버) |
| `/projects/[key]/documents` | 문서 관리 | Protected (멤버) |
| `/projects/[key]/activity` | 활동 피드 | Protected (멤버) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `DashboardStats` | 통계 카드 그리드 |
| `StatCard` | 개별 통계 카드 (숫자 + 아이콘) |
| `IssueDistributionChart` | 이슈 상태 분포 파이/바 차트 |
| `PriorityDistributionChart` | 우선순위 분포 차트 |
| `MilestoneProgressList` | 마일스톤 진행률 목록 |
| `MyAssignedList` | 내 할당 이슈/CO 목록 |
| `NotificationBell` | 알림 벨 아이콘 (미읽음 배지) |
| `NotificationDropdown` | 알림 드롭다운 패널 |
| `NotificationItem` | 개별 알림 항목 |
| `FileUploader` | 파일 업로드 컴포넌트 (드래그 앤 드롭) |
| `DocumentList` | 문서 목록 |
| `DocumentVersionHistory` | 문서 버전 이력 |
| `ActivityFeed` | 활동 피드 타임라인 |
| `ActivityItem` | 개별 활동 항목 |
| `EmptyState` | 데이터 없음 안내 컴포넌트 |

### SSE (Server-Sent Events) 구현

```
/api/sse/notifications
├── 연결: 인증된 사용자별 SSE 스트림
├── 이벤트: notification (새 알림)
├── 재연결: 자동 재연결 (3초 간격)
└── 정리: 연결 해제 시 리소스 정리
```

### 파일 스토리지 추상화

```
src/lib/storage/
├── index.ts          # Storage interface
├── local.ts          # 로컬 파일시스템 (개발)
└── r2.ts             # Cloudflare R2 (프로덕션)
```

---

## Edge Cases & Risks

- EC-001: Empty State - 신규 사용자/프로젝트에 대한 안내 UI 제공 (프로젝트 생성 유도)
- EC-002: 대용량 파일 - 50MB 제한 클라이언트+서버 양측 검증, 초과 시 에러 메시지
- EC-003: 알림 스팸 방지 - 동일 이벤트 5분 쿨다운, 일괄 알림 통합
- EC-004: SSE 연결 끊김 - 자동 재연결, 재연결 시 놓친 알림 폴링으로 보완
- EC-005: 파일 스토리지 전환 - 추상화 계층으로 로컬 FS <-> R2 무중단 전환
- EC-006: 대시보드 통계 캐싱 - 실시간 계산 대신 1분 캐시 적용
- RISK-001: SSE 연결 수 관리 -> Vercel Serverless 환경 SSE 제한 고려, 폴링 폴백 필요 (영향: 높음)
- RISK-002: 파일 업로드 보안 -> MIME 타입 검증, 파일명 난독화, 악성 파일 차단 (영향: 높음)
- RISK-003: 대시보드 쿼리 성능 -> 집계 쿼리 최적화, 캐싱 적용 (영향: 중간)

---

## Files to Create/Modify

### 신규 생성 파일 (~14개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/notification/schemas/notifications.ts` | notifications 스키마 |
| `src/modules/notification/schemas/activity-logs.ts` | activity_logs 스키마 |
| `src/modules/notification/router.ts` | notification tRPC 라우터 |
| `src/modules/notification/service.ts` | notification 서비스 |
| `src/modules/document/schemas/documents.ts` | documents 스키마 |
| `src/modules/document/schemas/file-versions.ts` | file_versions 스키마 |
| `src/modules/document/router.ts` | document tRPC 라우터 |
| `src/modules/document/service.ts` | document 서비스 |
| `src/modules/reporting/router.ts` | reporting tRPC 라우터 |
| `src/modules/reporting/service.ts` | reporting 서비스 |
| `src/app/api/sse/notifications/route.ts` | SSE 엔드포인트 |
| `src/app/dashboard/page.tsx` | 메인 대시보드 |
| `src/lib/storage/index.ts` | 스토리지 추상화 |
| `src/lib/storage/local.ts` | 로컬 스토리지 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | notification, document 스키마 import |
| `src/server/trpc/router.ts` | notification, document, reporting 라우터 등록 |
| `src/app/layout.tsx` | NotificationBell 헤더에 추가 |
| `src/app/projects/[key]/layout.tsx` | 문서/활동 네비게이션 추가 |
| `src/lib/event-bus.ts` | 알림 이벤트 구독 추가 |

---

## Testing Strategy

### Unit Tests

- 대시보드 통계 계산 로직
- 알림 생성 및 쿨다운 로직
- 파일 MIME 타입 검증
- 파일 크기 제한 검증
- 활동 로그 생성 로직

### Integration Tests

- 이슈 생성 → 알림 생성 확인
- 변경 주문 제출 → 승인자 알림 생성 확인
- 파일 업로드 → 문서 생성 → 다운로드 플로우
- 파일 새 버전 업로드 → 이전 버전 보존 확인
- 대시보드 통계 쿼리 정확성

### E2E Tests

- 대시보드 통계 카드 + 차트 렌더링 확인
- 알림 벨 → 드롭다운 → 알림 클릭 → 리소스 이동 플로우
- 파일 업로드 → 첨부 → 다운로드 전체 UI 플로우
- Empty State 표시 확인 (신규 사용자)
