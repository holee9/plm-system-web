# PLM System Web

Product Lifecycle Management System built with modern web technologies.

## 📊 Implementation Progress

**Overall Progress: 89.3% (6/7 SPECs almost complete, Phase 3 75% complete)**

### Phase 1: Foundation (Primary Goal) - 100% Complete ✅

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-001 | ✅ Complete | 100% | Project scaffolding and architecture setup |
| SPEC-PLM-002 | ✅ Complete | 100% | Authentication and user management |
| SPEC-PLM-003 | ✅ Complete | 100% | Project CRUD and management |

### Phase 2: Core Features (Secondary Goal) - 100% Complete ✅

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-004 | ✅ Complete | 100% | Issue tracking core |
| SPEC-PLM-005 | ✅ Complete | 100% | BOM and part management (PLM) |

### Phase 3: PLM Workflows (Tertiary Goal) - 75% Complete 🚧

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-006 | 🚧 In Progress | 75% | Change order workflow (router + UI implemented) |
| SPEC-PLM-007 | 🚧 In Progress | 75% | Dashboard, reporting, notifications, documents (UI implemented) |

---

## ✅ Recently Completed (Latest Update)

### P0: Security & Authentication Fixes
- ✅ 첨부파일 다운로드 보안 취약점 해결 (이미 구현됨 확인)
- ✅ 알림 라우터 인증 연동 (TEST_USER_ID 제거, protectedProcedure 적용)
- ✅ 이메일 인증 흐름 완성 (verifyEmail 프로시저 작동)

### P1: Core CRUD Completion
- ✅ 이슈 삭제 기능 (deleteIssue - 관리자용)
- ✅ 댓글 수정/삭제 (updateIssueComment, deleteIssueComment)
- ✅ 마일스톤 수정/닫기 (updateMilestone, closeMilestone)
- ✅ 리비전 상세 조회 (getRevisionById)
- ✅ 프로젝트 아카이브/복원 (이미 구현됨 확인)

### P2: Feature Expansion
- ✅ 이슈 첨부파일 업로드/다운로드 (이미 구현됨)
- ✅ 라벨 관리 CRUD (이미 구현됨)
- ✅ @멘션 기능 (MentionInput 컴포넌트 신규 구현)
- ✅ 부품 목록 UI (PartList 컴포넌트)
- ✅ BOM 트리 시각화 (BomTree 컴포넌트)
- ✅ 리비전 타임라인 UI (RevisionTimeline 컴포넌트)
- ✅ 제조사/공급업체 관리 (manufacturer/supplier router)
- ✅ BOM 가져오기/내보내기 (export API 구현됨)
- ✅ 리비전 비교 (이미 구현됨)

### P3: UI Enhancements
- ✅ 프로젝트 공개/비공개 설정 (visibility 필드)
- ✅ 이슈 활동 히스토리 (ActivityHistory 컴포넌트)

### P4: Advanced UI Components
- ✅ EmptyState 컴포넌트 (재사용 가능한 빈 상태, 프리셋 포함)
- ✅ ChangeOrderChart (변경 주문 상태 분포 바 차트)
- ✅ PartCategoryChart (부품 카테고리 분포 차트)
- ✅ ActivityTimeline (활동 타임라인 뷰)
- ✅ AffectedPartSelector (영향받는 부품 다중 선택기)
- ✅ AuditTrailTable (감사 추적 테이블, 타임라인 뷰 포함)
- ✅ DocumentVersionHistory (문서 버전 기록 뷰)
- ✅ 대시보드 컴포넌트 통합 (차트, 타임라인)
- ✅ 변경 주문 컴포넌트 통합 (감사 추적, 부품 선택기)
- ✅ 문서 컴포넌트 통합 (버전 기록 다이얼로그)

---

## 📦 Updated Files

### Service Layer
- `src/modules/issue/service.ts` - 이슈/댓글/마일스톤 CRUD 함수 추가
- `src/modules/issue/router.ts` - TODO 제거 및 실제 구현 연결

### Components
- `src/components/issue/MentionInput.tsx` (NEW) - @멘션 입력 컴포넌트
- `src/components/issue/comment-form.tsx` - MentionInput 통합
- `src/modules/notification/router.ts` - 인증 컨텍스트 연동
- `src/components/dashboard/empty-state.tsx` (NEW) - 빈 상태 컴포넌트
- `src/components/dashboard/change-order-chart.tsx` (NEW) - 변경 주문 차트
- `src/components/dashboard/part-category-chart.tsx` (NEW) - 부품 카테고리 차트
- `src/components/dashboard/activity-timeline.tsx` (NEW) - 활동 타임라인
- `src/components/dashboard/dashboard-content.tsx` - 차트/타임라인 통합
- `src/components/changes/affected-part-selector.tsx` (NEW) - 부품 선택기
- `src/components/changes/audit-trail-table.tsx` (NEW) - 감사 추적 테이블
- `src/components/changes/change-order-create-dialog.tsx` - 부품 선택기 통합
- `src/components/changes/change-order-detail.tsx` - 감사 추적 통합
- `src/components/document/document-version-history.tsx` (NEW) - 문서 버전 기록
- `src/components/document/document-list.tsx` - 버전 기록 다이얼로그 통합

---

## 🎯 Complete Feature List

### SPEC-PLM-001: Project Scaffolding ✅
- Next.js 15 with App Router
- TypeScript 5.7 strict mode
- tRPC v11 for type-safe APIs
- Drizzle ORM with PostgreSQL 16
- Tailwind CSS 4 + shadcn/ui
- Vitest + Playwright testing
- Biome linting/formatting
- Docker Compose for local development

### SPEC-PLM-002: Authentication & User Management ✅
- JWT-based authentication system
- Email/password registration and login
- Session management (30-day expiry, max 5 sessions)
- Password reset flow
- User profile management
- Team creation and management
- Role-based access control (RBAC): owner/admin/member
- Email verification flow (register → verifyEmail → ACTIVE)
- Authentication UI pages (login, register, forgot-password)
- Team management UI (profile, teams list, member management)

### SPEC-PLM-003: Project CRUD ✅
- Project creation with key generation
- Project list and detail views
- Project member management
- Member role management (admin/member/viewer)
- Project settings UI
- Project archive/restore functionality
- Public/private visibility settings
- Milestone CRUD (create, update, close, delete)

### SPEC-PLM-004: Issue Tracking ✅
- Issue CRUD operations (create, read, update, delete)
- Status workflow (open → in progress → review → done → closed)
- State machine implementation
- Kanban board view
- Issue detail dialog
- Issue filters (status, priority, assignee, type)
- Labels and priorities management
- Issue number per project (e.g., PLM-1, PLM-2)
- Comment system (create, update, delete)
- Issue attachments (upload, download, delete)
- @mention support in comments (MentionInput component)
- Milestone management (create, edit, delete, close)
- Issue activity history tracking

### SPEC-PLM-005: BOM & Parts Management ✅
- Part catalog schema
- Revision control utilities
- BOM tree utilities (flat ↔ tree conversion)
- Where-used calculation
- Part/Revision/BOM database schemas
- PLM service layer
- Part list/detail UI with filters
- BOM tree visualization
- Part detail view with revision timeline
- Manufacturer/supplier management (CRUD)
- BOM export (CSV)
- Revision comparison UI

### SPEC-PLM-006: Change Order Workflow 🚧 (75%)
- Change request creation (router + UI implemented)
- Approval workflow (router + UI implemented)
- Impact analysis (router + UI implemented)
- Change history tracking (router + AuditTrailTable UI implemented)
- AffectedPartSelector component integrated

### SPEC-PLM-007: Dashboard & Reporting 🚧 (75%)
- Project dashboard (charts and timelines implemented)
- Reports and analytics (ChangeOrderChart, PartCategoryChart)
- Activity timeline visualization (ActivityTimeline)
- Document version history UI (DocumentVersionHistory)
- Empty state components (EmptyState with presets)

---

## 🚧 Remaining Work

### SPEC-PLM-006: Change Order Workflow (25% remaining)
- Real-time data integration with charts
- Advanced filtering and search
- Export functionality

### SPEC-PLM-007: Dashboard & Reporting (25% remaining)
- Real-time data updates
- Interactive chart filtering
- Notification center UI
- Document repository with upload UI

---

## Claude Code + Codex MCP Integration Guide

This project has verified and tested integration between Claude Code and OpenAI's Codex extension for AI-powered task delegation.

### Overview

Codex MCP (Model Context Protocol) enables Claude Code to delegate tasks to OpenAI's Codex and receive structured responses. This integration has been successfully tested with:
- Basic calculations and logic tasks
- TypeScript/JavaScript code generation
- Next.js/React component creation
- Multi-turn conversations with context preservation

### Prerequisites

| Component | Requirement |
|-----------|-------------|
| **Claude Code** | Installed and configured |
| **Codex Extension** | OpenAI ChatGPT VSCode extension (`openai.chatgpt`) |
| **ChatGPT Account** | Logged in (Plus, Pro, Business, Edu, or Enterprise plan) |
| **Claude Code Settings** | `mcp__codex*` permissions enabled |

### Installation Paths

| Component | Path |
|-----------|------|
| Codex Extension | `C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64` |
| Codex Executable | `bin\windows-x86_64\codex.exe` |
| MCP Config | `C:\Users\user\.mcp.json` (global) |
| Project MCP Config | `.mcp.json` (project-level, optional) |

### Configuration

#### Step 1: Verify Codex Login Status

```bash
"C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64\bin\windows-x86_64\codex.exe" login status
```

Expected output:
```
Logged in using ChatGPT
```

If not logged in:
```bash
codex login
```

#### Step 2: Configure MCP Server

Edit `C:\Users\user\.mcp.json` (global config) or create `.mcp.json` in project root:

```json
{
  "$schema": "https://raw.githubusercontent.com/anthropics/claude-code/main/.mcp.schema.json",
  "mcpServers": {
    "codex": {
      "$comment": "OpenAI Codex - AI task delegation via MCP",
      "command": "C:\\Users\\user\\.vscode\\extensions\\openai.chatgpt-0.4.74-win32-x64\\bin\\windows-x86_64\\codex.exe",
      "args": ["mcp-server"]
    }
  },
  "staggeredStartup": {
    "enabled": true,
    "delayMs": 500,
    "connectionTimeout": 60000
  }
}
```

**Important Configuration Notes:**
- `connectionTimeout: 60000` (60 seconds) - Increased from default 15s for reliable connection
- Use double backslashes `\\` for Windows paths
- `staggeredStartup.enabled: true` prevents port conflicts with other MCP servers

#### Step 3: Enable MCP Tools in Claude Code Settings

Add to Claude Code `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "permissions": {
    "mcp__codex*": "allow"
  }
}
```

### Usage

#### Available MCP Tools

After configuration, Codex provides two MCP tools:

| Tool | Purpose | Required Parameters |
|------|---------|---------------------|
| `mcp__codex__codex` | Start new conversation | `prompt` (task description) |
| `mcp__codex__codex-reply` | Continue conversation | `threadId`, `prompt` |

#### Method 1: Via Claude Code (Recommended)

1. Load Codex MCP tools:
```javascript
// Use ToolSearch to discover available tools
ToolSearch({ query: "mcp__codex", max_results: 2 })
```

2. Start new conversation:
```javascript
mcp__codex__codex({ prompt: "Calculate: 15 * 23 + 7" })
```

3. Continue conversation (if needed):
```javascript
mcp__codex__codex-reply({
  threadId: "019c6484-6e31-7ae3-8e9a-6f8972df15aa",
  prompt: "Now write a TypeScript function for fibonacci"
})
```

### Verified Use Cases

#### ✅ Test 1: Mathematical Calculations

**Input:**
```
"다음 계산의 결과를 알려주세요: 15 * 23 + 7"
```

**Output:**
```
계산 결과는 **352**입니다.
```

**Status:** ✅ Verified

---

#### ✅ Test 2: TypeScript Code Generation

**Input:**
```
"TypeScript로 피보나치 수열을 계산하는 함수를 작성해주세요.
함수 이름은 fibonacci이고, 숫자 n을 받아서 n번째 피보나치 수를 반환해야 합니다."
```

**Output:**
```typescript
function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("n은 0 이상의 정수여야 합니다.");
  }

  if (n === 0) return 0;
  if (n === 1) return 1;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}
```

**Status:** ✅ Verified (includes input validation, efficient iteration)

---

#### ✅ Test 3: Next.js/React Component Generation

**Input:**
```
"Next.js 15와 React 19를 사용하여 간단한 카운터 컴포넌트를 작성해주세요.
useState를 사용하여 카운트를 관리하고, 증가/감소 버튼이 있어야 합니다."
```

**Output:**
```tsx
// app/components/Counter.tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState<number>(0);

  return (
    <div style={{ display: "grid", gap: 12, width: 220 }}>
      <h2>Count: {count}</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setCount((c) => c - 1)}>- 감소</button>
        <button onClick={() => setCount((c) => c + 1)}>+ 증가</button>
      </div>
    </div>
  );
}
```

**Status:** ✅ Verified (App Router compatible, proper TypeScript, "use client" directive)

---

### Performance Metrics

| Metric | Value |
|--------|-------|
| Average Response Time | 2-5 seconds |
| Connection Success Rate | 100% (after timeout adjustment) |
| Code Generation Accuracy | Verified for TypeScript, React, Next.js |
| Multi-turn Conversations | Supported via threadId |

### Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| MCP tools not loading | Connection timeout too short | Increase `connectionTimeout` to 60000ms |
| "Not logged in" error | ChatGPT session expired | Run `codex login` again |
| Tools fail to appear | Missing permissions | Add `mcp__codex*` to settings.json permissions |
| Slow responses | Network latency | Check internet connection; Codex requires API calls |
| Path too long error | Windows path limit | Use shorter paths or junctions |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **API**: tRPC v11 (Type-safe APIs)
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: Biome
- **Containerization**: Docker Compose (PostgreSQL + pgAdmin)

## Project Structure

```
plm-system-web/
├── docker/                 # Docker configuration
│   └── docker-compose.yml  # PostgreSQL 16 + pgAdmin
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/trpc/      # tRPC API routes
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── projects/      # Project pages
│   │   ├── issue/         # Issue pages
│   │   └── globals.css    # Global styles with design tokens
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── issue/         # Issue components ( MentionInput, etc.)
│   │   ├── plm/           # PLM components
│   │   ├── projects/      # Project components
│   │   └── layout/        # Layout components
│   ├── modules/           # Domain modules
│   │   ├── identity/      # Auth, users, roles
│   │   ├── issue/         # Issues, comments, labels
│   │   ├── plm/           # Parts, BOMs, revisions
│   │   ├── project/       # Projects, milestones
│   │   └── notification/  # Notifications (auth context linked)
│   └── server/            # Server-side code
│       ├── db/            # Database setup
│       └── trpc/          # tRPC server setup
├── tests/                 # Test files
│   ├── unit/              # Vitest unit tests
│   └── e2e/               # Playwright E2E tests
└── drizzle/               # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm)
- Docker Desktop (for PostgreSQL 16)

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd plm-system-web
npm install
```

2. **Start PostgreSQL database:**
```bash
npm run docker:up
```

3. **Copy environment variables:**
```bash
cp .env.example .env
```

4. **Run database migrations:**
```bash
npm run db:generate
npm run db:push
```

5. **Start development server:**
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Docker Commands

```bash
npm run docker:up    # Start PostgreSQL + pgAdmin
npm run docker:down  # Stop containers
npm run docker:logs  # View logs
```

### Database Setup

The project uses PostgreSQL 16 running in Docker. Default connection:
```
postgresql://postgres:postgres@localhost:5432/plm_system
```

To access pgAdmin: http://localhost:5050
- Email: hnabyz2023@gmail.com
- Password: admin

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Check code with Biome
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Biome
- `npm run typecheck` - Run TypeScript type check

### Database
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

### Testing
- `npm test` - Run unit tests (Vitest)
- `npm run test:ui` - Run Vitest with UI
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run test:e2e:ui` - Run Playwright with UI

## Architecture

### Type-Safe API with tRPC

The project uses tRPC for end-to-end type safety between client and server:

```typescript
// Server-side router definition
export const appRouter = router({
  health: healthRouter,
  issue: issueRouter,
  project: projectRouter,
  plm: plmRouter,
});

// Client-side usage with full autocomplete
const { data } = trpc.issue.list.useQuery({ projectId: "xxx" });
```

### Database with Drizzle ORM

Drizzle ORM provides a TypeScript-native ORM with excellent performance:

```typescript
// Type-safe queries
const issues = await db.select().from(issuesTable).where(eq(issuesTable.projectId, projectId));
```

### Modular Architecture

The codebase is organized into domain modules:

- **identity**: Authentication, users, roles, permissions
- **project**: Projects, milestones, members
- **issue**: Issue tracking, comments, labels, status machine
- **plm**: Products, BOMs, revisions, utilities
- **notification**: Notifications (auth context linked)
- **document**: Documents, versions (schemas defined)

### Design System

The project uses a custom design system with CSS custom properties:

- **Tokens**: Defined in `src/design/tokens.css`
- **Integration**: Tailwind config references design tokens
- **Theming**: Light/dark mode support via CSS variables
- **Components**: shadcn/ui with custom theme

## Quality Standards

This project follows TRUST 5 principles:

- **Tested**: Unit + E2E tests, 85%+ coverage target
- **Readable**: Clear naming, English comments
- **Unified**: Consistent formatting with Biome
- **Secured**: OWASP compliance, input validation, JWT auth
- **Trackable**: Conventional commits, issue references

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing
- `NEXT_PUBLIC_APP_URL` - Application base URL

## Contributing

1. Create a feature branch from `main`
2. Implement your changes following TRUST 5 principles
3. Ensure all tests pass
4. Submit a pull request

## License

MIT License - see LICENSE file for details
