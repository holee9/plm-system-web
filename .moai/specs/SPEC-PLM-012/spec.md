# SPEC-PLM-012: 사용자 지정 대시보드 (Custom Dashboard)

## Metadata

- ID: SPEC-PLM-012
- Status: Draft
- Priority: P3
- Size: M
- Dependencies: SPEC-PLM-003 (Project CRUD)
- Created: 2026-02-18
- Author: MoAI (drake)

## Overview

사용자가 프로젝트 대시보드를 개인화할 수 있는 위젯 기반 커스터마이제이션 기능을 구현합니다.
위젯 추가/제거/재배열, 크기 조절, 템플릿 저장/로드, 드래그 앤 드롭 레이아웃을 지원하여
각 사용자가 자신의 워크플로우에 맞는 대시보드를 구성할 수 있도록 합니다.

---

## Requirements (EARS Format)

### Functional Requirements

#### Widget Management

- FR-001: **WHEN** 사용자가 위젯 추가 패널을 열면 **THEN** 시스템은 사용 가능한 위젯 목록(통계, 차트, 목록, 카드)을 표시해야 한다
- FR-002: **WHEN** 사용자가 위젯을 선택하여 추가하면 **THEN** 시스템은 해당 위젯을 대시보드 그리드에 추가해야 한다
- FR-003: **WHEN** 사용자가 위젯 삭제를 요청하면 **THEN** 시스템은 확인 다이얼로그 후 위젯을 제거해야 한다
- FR-004: **WHEN** 사용자가 위젯을 드래그하면 **THEN** 시스템은 실시간으로 위젯 위치를 미리보기로 표시해야 한다
- FR-005: **WHEN** 드래그가 끝나면 **THEN** 시스템은 위젯의 새 위치를 저장하고 레이아웃을 재구성해야 한다
- FR-006: **WHEN** 사용자가 위젯 크기 조절 핸들을 드래그하면 **THEN** 시스템은 위젯 크기를 실시간으로 변경해야 한다
- FR-007: **WHEN** 크기 조절이 완료되면 **THEN** 시스템은 새 크기 정보를 저장해야 한다

#### Dashboard Customization

- FR-008: 시스템은 **항상** 프로젝트별 독립적인 대시보드 설정을 유지해야 한다
- FR-009: **WHEN** 사용자가 대시보드 설정을 변경하면 **THEN** 시스템은 자동으로 저장해야 한다 (Auto-save)
- FR-010: **WHEN** 사용자가 템플릿으로 저장을 요청하면 **THEN** 시스템은 현재 레이아웃을 템플릿으로 저장해야 한다
- FR-011: **WHEN** 사용자가 템플릿을 적용하면 **THEN** 시스템은 해당 템플릿 레이아웃으로 대시보드를 재구성해야 한다
- FR-012: **WHEN** 사용자가 기본 레이아웃 복원을 요청하면 **THEN** 시스템은 시스템 기본 템플릿을 적용해야 한다
- FR-013: **IF** 저장된 레이아웃이 없으면 **THEN** 시스템은 기본 레이아웃을 표시해야 한다

#### Multi-Dashboard Support

- FR-014: **WHEN** 사용자가 새 대시보드 탭을 생성하면 **THEN** 시스템은 빈 대시보드를 생성해야 한다
- FR-015: **WHEN** 사용자가 대시보드 탭 이름을 변경하면 **THEN** 시스템은 탭 이름을 업데이트해야 한다
- FR-016: **WHEN** 사용자가 대시보드 탭을 삭제하면 **THEN** 시스템은 해당 탭과 레이아웃을 제거해야 한다
- FR-017: 시스템은 **항상** 최소 하나의 대시보드 탭을 유지해야 한다

### Non-Functional Requirements

- NFR-001: 위젯 드래그 앤 드롭 응답 시간은 100ms 이내여야 한다 (60fps)
- NFR-002: 레이아웃 저장은 500ms 이내에 완료되어야 한다
- NFR-003: 대시보드 로딩 시간은 1초 이내여야 한다
- NFR-004: 위젯은 CSS Grid 기반으로 반응형 레이아웃을 지원해야 한다
- NFR-005: 드래그 앤 드롭은 터치 디바이스에서도 동작해야 한다
- NFR-006: 레이아웃 데이터는 JSON 형식으로 저장해야 한다
- NFR-007: 위젯 크기는 미리 정의된 단위(1x1, 2x1, 2x2, 3x2 등)로 제한해야 한다

---

## User Stories

- US-001: 프로젝트 관리자로서, 중요한 통계 위젯을 상단에 배치할 수 있어야 한다, 그래서 핵심 지표를 한눈에 볼 수 있다
- US-002: 팀 멤버로서, 위젯을 드래그하여 원하는 위치로 이동할 수 있어야 한다, 그래서 작업 흐름에 맞는 레이아웃을 만들 수 있다
- US-003: 팀 멤버로서, 위젯 크기를 조절할 수 있어야 한다, 그래서 중요한 정보를 더 크게 표시할 수 있다
- US-004: 프로젝트 관리자로서, 커스텀 레이아웃을 템플릿으로 저장할 수 있어야 한다, 그래서 다른 프로젝트에서도 재사용할 수 있다
- US-005: 팀 멤버로서, 여러 개의 대시보드 탭을 만들 수 있어야 한다, 그래서 목적별로 다른 뷰를 구성할 수 있다
- US-006: 신규 사용자로서, 기본 레이아웃으로 시작할 수 있어야 한다, 그래서 바로 사용할 수 있다

---

## Acceptance Criteria

- AC-001: Given 대시보드 편집 모드에서, When 위젯 추가 버튼을 클릭하면, Then 사용 가능한 위젯 목록이 사이드 패널에 표시된다
- AC-002: Given 위젯 패널에서, When 위젯을 클릭하면, Then 위젯이 대시보드 그리드에 추가된다
- AC-003: Given 대시보드에서, When 위젯을 다른 위치로 드래그하면, Then 위젯이 부드럽게 이동하고 다른 위젯들이 자동으로 재배치된다
- AC-004: Given 위젯 크기 조절 모드에서, When 핸들을 드래그하면, Then 위젯 크기가 실시간으로 변경된다
- AC-005: Given 커스터마이즈된 대시보드에서, When 페이지를 새로고침하면, Then 저장된 레이아웃이 복원된다
- AC-006: Given 템플릿 저장 다이얼로그에서, When 템플릿 이름을 입력하고 저장하면, Then 템플릿이 목록에 추가된다
- AC-007: Given 템플릿 목록에서, When 템플릿을 선택하여 적용하면, Then 대시보드가 해당 템플릿 레이아웃으로 변경된다
- AC-008: Given 새 대시보드 탭 버튼에서, When 클릭하면, Then 새 탭이 생성되고 활성화된다
- AC-009: Given 기본 레이아웃으로 복원 버튼에서, When 클릭하면, Then 확인 후 기본 레이아웃이 적용된다
- AC-010: Given 저장된 레이아웃이 없는 사용자가, When 프로젝트 대시보드에 처음 접근하면, Then 기본 레이아웃이 표시된다

---

## Technical Design

### Widget Types

| Type | ID | Description | Default Size |
|------|-----|-------------|--------------|
| Statistics | `stat-card` | 프로젝트/이슈 통계 카드 | 1x1 |
| Chart | `chart-line` | 라인 차트 (추세) | 2x1 |
| Chart | `chart-bar` | 바 차트 (비교) | 2x1 |
| Chart | `chart-pie` | 파이 차트 (분포) | 2x2 |
| List | `list-issues` | 이슈 목록 | 2x2 |
| List | `list-activities` | 활동 피드 | 2x1 |
| Card | `card-project` | 프로젝트 요약 카드 | 2x1 |
| Card | `card-health` | 시스템 상태 카드 | 1x1 |

### Database Tables

**user_dashboards**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK, default gen_random_uuid() |
| project_id | uuid | FK -> projects.id, NOT NULL |
| user_id | uuid | FK -> users.id, NOT NULL |
| name | varchar(100) | NOT NULL, default 'Dashboard' |
| is_default | boolean | default false |
| layout_config | jsonb | NOT NULL, default '{}' |
| created_at | timestamp | NOT NULL, default now() |
| updated_at | timestamp | NOT NULL, default now() |
| UNIQUE(project_id, user_id, name) | | |

**dashboard_templates**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| project_id | uuid | FK -> projects.id, nullable (null = system template) |
| created_by | uuid | FK -> users.id, NOT NULL |
| name | varchar(100) | NOT NULL |
| description | text | nullable |
| layout_config | jsonb | NOT NULL |
| is_public | boolean | default false |
| created_at | timestamp | NOT NULL |
| UNIQUE(project_id, name) | | |

### Layout Config Schema (JSONB)

```json
{
  "version": 1,
  "columns": 12,
  "rowHeight": 80,
  "gap": 16,
  "widgets": [
    {
      "id": "widget-uuid-1",
      "type": "stat-card",
      "x": 0,
      "y": 0,
      "w": 3,
      "h": 1,
      "config": {
        "metric": "issue_count",
        "label": "Total Issues"
      }
    },
    {
      "id": "widget-uuid-2",
      "type": "chart-line",
      "x": 3,
      "y": 0,
      "w": 6,
      "h": 2,
      "config": {
        "dataSource": "issue_trend",
        "timeRange": "30d"
      }
    }
  ]
}
```

### tRPC Procedures

```
dashboard.router
├── getDashboards      # query: 사용자의 대시보드 목록
├── getDashboard       # query: 특정 대시보드 상세
├── createDashboard    # mutation: 새 대시보드 생성
├── updateDashboard    # mutation: 대시보드 이름/설정 변경
├── deleteDashboard    # mutation: 대시보드 삭제
├── saveLayout         # mutation: 레이아웃 저장 (auto-save)
├── resetLayout        # mutation: 기본 레이아웃으로 복원
├── getTemplates       # query: 사용 가능한 템플릿 목록
├── saveTemplate       # mutation: 현재 레이아웃을 템플릿으로 저장
├── applyTemplate      # mutation: 템플릿 적용
└── deleteTemplate     # mutation: 템플릿 삭제
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/projects/[key]/dashboard` | 프로젝트 대시보드 (기본) | Protected (멤버) |
| `/projects/[key]/dashboard/custom` | 커스텀 대시보드 편집 | Protected (멤버) |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `WidgetGrid` | CSS Grid 기반 위젯 컨테이너 |
| `WidgetWrapper` | 드래그/리사이즈 가능한 위젯 래퍼 |
| `WidgetConfig` | 위젯 설정 패널 |
| `WidgetPalette` | 위젯 추가 사이드 패널 |
| `DashboardTabs` | 대시보드 탭 네비게이션 |
| `TemplateDialog` | 템플릿 저장/로드 다이얼로그 |
| `LayoutPreview` | 레이아웃 미리보기 |

### Existing Widget Components (Reuse)

| 컴포넌트 | 설명 | 위치 |
|---------|------|------|
| `StatCard` | 통계 카드 | `src/components/dashboard/stat-card.tsx` |
| `ActivityFeed` | 활동 피드 | `src/components/dashboard/activity-feed.tsx` |
| `ActivityTimeline` | 활동 타임라인 | `src/components/dashboard/activity-timeline.tsx` |
| `SystemHealth` | 시스템 상태 | `src/components/dashboard/system-health.tsx` |
| `PartCategoryChart` | 부품 카테고리 차트 | `src/components/dashboard/part-category-chart.tsx` |
| `ChangeOrderChart` | 변경 주문 차트 | `src/components/dashboard/change-order-chart.tsx` |

---

## Edge Cases & Risks

- EC-001: 빈 대시보드 - 위젯이 없을 때 안내 메시지와 위젯 추가 버튼 표시
- EC-002: 위젯 중복 추가 - 동일 위젯을 여러 번 추가 가능 (각각 독립적인 ID)
- EC-003: 레이아웃 충돌 - 여러 탭에서 동시 편집 시 마지막 저장 우선 (낙관적 업데이트)
- EC-004: 위젯 데이터 로딩 실패 - 스켈레톤 UI + 에러 상태 표시
- EC-005: 모바일 레이아웃 - 그리드 단순화 (1열 레이아웃으로 자동 전환)
- EC-006: 대규모 위젯 - 최대 위젯 수 제한 (성능 보호)
- RISK-001: 레이아웃 JSON 스키마 변경 -> 버전 관리 및 마이그레이션 전략 필요 (영향: 중간)
- RISK-002: 드래그 성능 -> 가상화 고려, 위젯 수 제한 (영향: 중간)
- RISK-003: 터치 디바이스 호환성 -> @dnd-kit 터치 센서 설정 필요 (영향: 낮음)

---

## Files to Create/Modify

### 신규 생성 파일 (~15개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/dashboard/widget-service.ts` | 위젯 유틸리티 및 타입 |
| `src/modules/dashboard/widget-types.ts` | 위젯 타입 정의 |
| `src/modules/dashboard/router.ts` | dashboard tRPC 라우터 |
| `src/modules/dashboard/schemas/dashboards.ts` | 대시보드 DB 스키마 |
| `src/modules/dashboard/schemas/templates.ts` | 템플릿 DB 스키마 |
| `src/app/projects/[key]/dashboard/custom/page.tsx` | 커스텀 대시보드 페이지 |
| `src/components/dashboard/widget-grid.tsx` | 위젯 그리드 컨테이너 |
| `src/components/dashboard/widget-wrapper.tsx` | 드래그/리사이즈 위젯 래퍼 |
| `src/components/dashboard/widget-config.tsx` | 위젯 설정 패널 |
| `src/components/dashboard/widget-palette.tsx` | 위젯 추가 패널 |
| `src/components/dashboard/dashboard-tabs.tsx` | 대시보드 탭 컴포넌트 |
| `src/components/dashboard/template-dialog.tsx` | 템플릿 다이얼로그 |
| `src/components/dashboard/layout-preview.tsx` | 레이아웃 미리보기 |
| `src/hooks/use-dashboard-layout.ts` | 대시보드 레이아웃 훅 |
| `src/hooks/use-widget-drag.ts` | 위젯 드래그 훅 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | dashboard 스키마 import 추가 |
| `src/server/trpc/router.ts` | dashboard 라우터 등록 |
| `src/app/projects/[key]/dashboard/page.tsx` | 커스텀 대시보드 링크 추가 |
| `src/components/dashboard/index.ts` | 신규 컴포넌트 export 추가 |

---

## Testing Strategy

### Unit Tests

- 위젯 타입 유효성 검증
- 레이아웃 JSON 스키마 검증
- 그리드 위치 계산 로직
- 템플릿 저장/로드 로직

### Integration Tests

- 대시보드 생성 -> 위젯 추가 -> 레이아웃 저장 -> 새로고침 복원 플로우
- 템플릿 저장 -> 적용 -> 삭제 플로우
- 탭 생성 -> 전환 -> 삭제 플로우

### E2E Tests

- 드래그 앤 드롭 위젯 재배열
- 위젯 크기 조절
- 템플릿 적용 전체 플로우
- 다중 탭 대시보드 관리

---

## Dependencies

### External Libraries

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| `@dnd-kit/core` | ^6.1.0 | 드래그 앤 드롭 코어 |
| `@dnd-kit/sortable` | ^8.0.0 | 정렬 가능한 리스트 |
| `@dnd-kit/utilities` | ^3.2.2 | DnD 유틸리티 |

### Note
프로젝트에 이미 @dnd-kit/core, @dnd-kit/sortable이 설치되어 있어
칸반 보드 구현과 동일한 라이브러리를 활용합니다.

---

## References

- SPEC-PLM-003: 프로젝트 CRUD 및 관리 (프로젝트 컨텍스트)
- SPEC-PLM-004: 이슈 관리 (이슈 위젯 데이터 소스)
- `src/components/issue/kanban-board.tsx`: 기존 @dnd-kit 구현 참조
- `src/components/dashboard/dashboard-content.tsx`: 기존 대시보드 구조 참조
