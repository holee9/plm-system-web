# Plan: PLM System Web - AI-Driven UX/UI Design Integration

## Context

이 프로젝트는 **Jira, OpenProject, Redmine**의 핵심 기능과 **PLM(Product Lifecycle Management)** 도구를 통합한 웹 기반 프로젝트 관리 플랫폼입니다.

**문제 정의:**
- 현재 Plan Phase에서 Pencil 디자인을 위한 AI Agent 역할이 명확히 정의되지 않음
- 레퍼런스 제품(Jira, OpenProject, Redmine)의 공통 구조와 Top 10 플러그인 연구가 누락됨
- Pencil 디자인 결과물(.pen 파일)이 SPEC 문서에 통합되어야 함

**목표:**
- AI Agent(team-designer)를 통해 Pencil 디자인 자동화
- 레퍼런스 제품들의 공통 UI/UX 패턴 연구 및 반영
- 디자인-개발 워크플로우 완성 (Pencil → Codex → Claude Code)

## Current Tech Stack

**프레임워크:** Next.js 15 + React 19
**상태 관리:** Zustand, TanStack Query
**UI 라이브러리:** shadcn/ui (Radix UI), Tailwind CSS 4.0
**백엔드:** tRPC, Drizzle ORM, PostgreSQL
**테스팅:** Vitest, Playwright

## Critical Files

| 파일 경로 | 설명 |
|----------|------|
| `src/app/layout.tsx` | 루트 레이아웃 |
| `src/components/layout/sidebar.tsx` | 사이드바 컴포넌트 |
| `src/components/layout/navbar.tsx` | 네비게이션 컴포넌트 |
| `src/components/ui/` | shadcn/ui 컴포넌트들 |
| `.mcp.json` | MCP 서버 설정 (Pencil 포함) |
| `.claude/agents/moai/expert-frontend.md` | 프론트엔드 에이전트 정의 |
| `.claude/agents/moai/team-designer.md` | 디자인 전담 에이전트 (생성 필요) |
| `docs/AI_UX_UI_Project_Plan_with_PLM.md` | 프로젝트 계획서 |

## Reference Products Research

### 공통 구조 (Jira, OpenProject, Redmine)

| 구성 요소 | 설명 |
|----------|------|
| **사이드바** | 프로젝트, 이슈, PLM 메뉴 네비게이션 |
| **대시보드** | 요약 통계, 활동 피드, 진행 상황 |
| **이슈 추적** | Kanban Board, List View, Gantt Chart |
| **프로젝트 관리** | 스프린트/마일스톤, 팀 할당, 일정 관리 |
| **PLM 통합** | BOM 관리, CAD 파일 연동, 변경 이력 |

### Top 10 공통 플러그인/기능

1. **Agile/Sprint Board** - Kanban 스타일 이슈 관리
2. **Gantt Chart** - 프로젝트 일정 시각화
3. **Time Tracking** - 작업 시간 추적
4. **Custom Fields** - 확장 가능한 필드 시스템
5. **Workflow/Status Transition** - 상태 변경 관리
6. **Dashboard/Reports** - 통계 및 리포팅
7. **File Attachments** - 파일/CAD 연동
8. **Comments/Activity Stream** - 협업 기능
9. **Permissions/Roles** - 역할별 접근 제어
10. **Notifications** - 알림 시스템

## Implementation Plan

### Phase 1: Reference Research & Pattern Extraction

1. **레퍼런스 제품 UI/UX 패턴 연구**
   - Jira: 대시보드 레이아웃, 이슈 보드, 사이드바 구조
   - OpenProject: Gantt 차트, 타임라인, 작업 패키지
   - Redmine: 프로젝트 오버뷰, 위키, 문서 관리

2. **공통 컴포넌트 패턴 추출**
   - 네비게이션: 사이드바 + 탭
   - 데이터 표현: 테이블, 카드, 칸반
   - 폼: 멀티 스텝, 모달, 드롭다운
   - 피드백: 토스트, 알림, 배지

### Phase 2: Pencil Design Agent Setup

1. **team-designer 에이전트 생성/확장**
   - 파일: `.claude/agents/moai/team-designer.md`
   - 역할: Pencil MCP를 사용한 UI/UX 디자인 전담
   - 권한: Pencil MCP 도구들
   - Skills: moai-domain-uiux, moai-design-tools

2. **Plan Phase 워크플로우 수정**
   - spec-workflow.md에 team-designer 추가
   - Plan Phase 연구 팀에 team-designer 포함
   - `.pen` 파일 생성을 SPEC 문서에 포함

### Phase 3: Design System Definition

1. **Pencil 디자인 변수 설정**
   - 색상 테마 (Light/Dark 모드)
   - 타이포그래피
   - 간격 (Spacing)
   - 둥근 모서리 (Border Radius)

2. **shadcn/ui 토큰 동기화**
   - Tailwind CSS 변수와 Pencil 변수 연동
   - `src/app/globals.css`에서 design tokens 정의

### Phase 4: Core Screen Designs (.pen files)

1. **대시보드** (`src/design/dashboard.pen`)
   - 통계 카드 (할당된 이슈, 진행률, 마감일)
   - 활동 피드
   - 프로젝트 목록

2. **이슈 보드** (`src/design/issue-board.pen`)
   - Kanban 레이아웃 (To Do, In Progress, Done)
   - 드래그 앤 드롭
   - 필터 및 검색

3. **프로젝트 상세** (`src/design/project-detail.pen`)
   - Gantt 차트
   - 팀 멤버
   - 마일스톤

4. **PLM 대시보드** (`src/design/plm-dashboard.pen`)
   - BOM 관리
   - CAD 파일 연동
   - 변경 이력

## AI 도구별 지정 작업 및 시작 지점

### 워크플로우 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AI 자동화 워크플로우                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Pencil     │───▶│    Codex     │───▶│ Claude Code  │              │
│  │  (디자인)    │    │ (코드 생성)  │    │  (자동화)    │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                      │
│         ▼                   ▼                   ▼                      │
│    .pen 파일         HTML/CSS/JS        파일 수정/배포                   │
│   (와이어프레임)      (컴포넌트 코드)      (Git 연동)                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1. Pencil (AI Agent: team-designer)

**지정 작업:**
- UX/UI 와이어프레임/프로토타입 설계
- 디자인 시스템 정의 (색상, 타이포그래피, 간격)
- 레퍼런스 제품(Jira, OpenProject, Redmine) UI 패턴 연구 및 적용

**시작 지점:** Plan Phase (team-designer 에이전트 실행 직후)

**산출물:** `.pen` 파일 (src/design/ 디렉토리)

**도구:** Pencil MCP (mcp__pencil__batch_design, get_screenshot 등)

---

### 2. Codex (VS Code Extension - GitHub Copilot)

**지정 작업:**
- **VS Code Extension으로 자동 동작** (별도 API 호출 불필요)
- 개발자가 `.pen` 파일 참조하여 코드 작성 시 **자동 코드 제안/완성**
- React/Next.js 컴포넌트 코드 실시간 생성 보조

**시작 지점:** `Run Phase - expert-frontend가 VS Code에서 컴포넌트 작성 시작 시`

```
자동 동작 방식:
1. expert-frontend가 VS Code에서 컴포넌트 파일 생성 (.tsx)
2. .pen 파일 내용을 주석/컨텍스트로 참조
3. GitHub Copilot이 자동으로 코드 제안
4. 개발자가 제안을 수락/수정하여 완성
```

**설정 상태:** VS Code Extension으로 이미 설치 및 동작 중

**산출물:** React 컴포넌트 코드 (VS Code editor에서 작성)

---

### 3. Claude Code (자동화 및 통합)

**지정 작업:**
- **파일 수정:** Codex가 생성한 코드를 프로젝트 구조에 맞게 수정
- **Git 연동:** 커밋, 브랜치 관리, PR 생성
- **CI/CD 자동화:** 빌드 스크립트, 테스트 실행, 배포 설정
- **코드 리뷰:** TRUST 5 준수 확인, LSP 검증

**시작 지점:** `Codex 코드 생성 후` (Run Phase)

```
시작 조건:
1. Codex가 컴포넌트 코드 생성 완료
2. expert-frontend가 코드 검토 요청
3. 파일 수정 또는 Git 작업 필요 시
```

**담당 에이전트:**
- expert-frontend (컴포넌트 수정)
- manager-ddd (DDD 구현)
- manager-git (Git 연동)
- manager-quality (코드 품질 검증)

---

## 상세 워크플로우

### Plan Phase

```
1. TeamCreate("moai-plan-{feature}")

2. 병렬 실행 (한 메시지에서 3개):
   Task(team-researcher): 코드베이스 구조 탐색
   Task(team-analyst):   요구사항 분석 (레퍼런스 제품 기능)
   Task(team-architect): 기술 아키텍처 설계

3. 연속 실행 (.pen 파일 생성):
   Task(team-designer):
     - Pencil MCP로 UI/UX 와이어프레임 생성
     - .pen 파일 저장 (src/design/*.pen)
     - 스크린샷 생성 (mcp__pencil__get_screenshot)
     - SPEC 문서에 .pen 경로 기록

4. Plan Phase 종료 조건:
   ✓ .pen 파일 4개 생성 완료
   ✓ SPEC 문서 작성 완료
   ✓ 스크린샷 검증 완료
```

### Sync Phase (문서화 및 준비)

```
준비 작업:
1. .pen 파일 스크린샷 첨부
2. 컴포넌트 사양 문서화
3. shadcn/ui 매핑 가이드 작성

산출물: 구현 가이드
  - .pen 파일별 구현 참고서
  - 컴포넌트 구조 가이드
```

### Run Phase (Claude Code 자동화)

```
1. expert-frontend (VS Code 환경):
   - .pen 파일을 참조하여 컴포넌트 파일 생성
   - GitHub Copilot 자동 코드 제안 활용
   - shadcn/ui 컴포넌트로 리팩토링
   - 상태 관리 연결 (Zustand, TanStack Query)

   작업 흐름:
   a) src/design/dashboard.pen 열어서 구조 확인
   b) VS Code에서 src/app/dashboard/page.tsx 생성
   c) Copilot이 자동으로 코드 제공 → Tab으로 수락
   d) 필요시 주석으로 프롬프트 추가하여 재생성

2. manager-ddd:
   - DDD 사이클 실행 (ANALYZE-PRESERVE-IMPROVE)
   - 테스트 작성 (85%+ 커버리지)

3. manager-git:
   - Git 커밋 생성
   - PR 오픈

4. manager-quality:
   - TRUST 5 검증
   - LSP 다이그노스틱 확인
```

## Files to Create/Modify

### 생성할 파일

1. `.claude/agents/moai/team-designer.md`
   - Pencil MCP 전담 에이전트 정의
   - UI/UX 디자인 자동화 역할

2. `src/design/*.pen` (4개 파일)
   - dashboard.pen
   - issue-board.pen
   - project-detail.pen
   - plm-dashboard.pen

3. `.moai/specs/SPEC-UI-001/` (SPEC 템플릿)
   - spec.md (요구사항 + .pen 파일 경로 포함)

### 수정할 파일

1. `.claude/rules/moai/workflow/spec-workflow.md`
   - Plan Phase에 team-designer 추가
   - .pen 파일 생성 프로세스 정의

2. `src/app/globals.css`
   - Pencil 디자인 토큰을 위한 CSS 변수 정의

## Verification Plan

1. **Pencil 디자인 검증**
   - team-designer가 .pen 파일 생성 확인
   - `mcp__pencil__get_screenshot`으로 시각적 검증

2. **레퍼런스 준수 확인**
   - Jira/OpenProject/Redmine 공통 패턴 포함 여부 체크리스트

3. **통합 테스트**
   - .pen → shadcn/ui 컴포넌트 변환
   - Tailwind CSS 테마 적용 확인

4. **코드 품질**
   - TRUST 5 준수 (Tested, Readable, Unified, Secured, Trackable)
   - 85%+ 테스트 커버리지

## Dependencies

- **Pencil MCP**: 실행 중이어야 함 (`C:\Program Files\Pencil\Pencil.exe --mcp`)
- **shadcn/ui**: 설치됨 (package.json 확인)
- **Claude Code**: 인증됨
- **GitHub Copilot**: VS Code Extension으로 설치 및 활성화됨 (이미 동작 중)

## Success Criteria

- [ ] team-designer 에이전트 생성 및 Pencil MCP 접근 권한 확인
- [ ] 레퍼런스 제품 Top 10 기능이 UI 디자인에 반영됨
- [ ] .pen 파일 4개 생성 (대시보드, 이슈 보드, 프로젝트 상세, PLM)
- [ ] SPEC 문서에 .pen 파일 경로 포함
- [ ] Pencil → shadcn/ui 코드 변환 워크플로우 작동

---

Version: 1.0.0
Created: 2026-02-15
Plan ID: delightful-baking-mist
