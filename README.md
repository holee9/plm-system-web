# PLM System Web

Product Lifecycle Management System built with modern web technologies.

## 📊 Implementation Progress

**Overall Progress: 28.6% (2/7 SPECs completed)**

### Phase 1: Foundation (Primary Goal) - 66.7% Complete

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-001 | ✅ Complete | 100% | Project scaffolding and architecture setup |
| SPEC-PLM-002 | ✅ Complete | 100% | Authentication and user management |
| SPEC-PLM-003 | ⏳ Pending | 0% | Project CRUD and management |

### Phase 2: Core Features (Secondary Goal) - 0% Complete

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-004 | ⏳ Pending | 0% | Issue tracking core |
| SPEC-PLM-005 | ⏳ Pending | 0% | BOM and part management (PLM) |

### Phase 3: PLM Workflows (Tertiary Goal) - 0% Complete

| SPEC | Status | Progress | Description |
|------|--------|----------|-------------|
| SPEC-PLM-006 | ⏳ Pending | 0% | Change order workflow |
| SPEC-PLM-007 | ⏳ Pending | 0% | Dashboard, reporting, notifications, documents |

---

## ✅ Completed Features

### SPEC-PLM-001: Project Scaffolding
- ✅ Next.js 15 with App Router
- ✅ TypeScript 5.7 strict mode
- ✅ tRPC v11 for type-safe APIs
- ✅ Drizzle ORM with PostgreSQL 16
- ✅ Tailwind CSS 4 + shadcn/ui
- ✅ Vitest + Playwright testing
- ✅ Biome linting/formatting
- ✅ Docker Compose for local development

### SPEC-PLM-002: Authentication & User Management
- ✅ JWT-based authentication system
- ✅ Email/password registration and login
- ✅ Session management (30-day expiry)
- ✅ Password reset flow
- ✅ User profile management
- ✅ Team creation and management
- ✅ Role-based access control (RBAC): owner/admin/member
- ✅ 270 tests written (100% coverage on core modules)
- ✅ Authentication UI pages (login, register, forgot-password)
- ✅ Team management UI (profile, teams list, member management)

---

## 🚧 Remaining Features

### SPEC-PLM-003: Project CRUD (Next)
- Project creation, editing, deletion
- Project member management
- Project visibility settings
- Milestone tracking

### SPEC-PLM-004: Issue Tracking
- Issue CRUD operations
- Status workflow (todo → in progress → in review → done)
- Kanban board view
- Issue comments and attachments
- Labels and priorities

### SPEC-PLM-005: BOM & Parts Management
- Part catalog management
- BOM tree structure
- Revision control
- Manufacturer/supplier information

### SPEC-PLM-006: Change Order Workflow
- Change request creation
- Approval workflow
- Impact analysis
- Change history tracking

### SPEC-PLM-007: Dashboard & Reporting
- Project dashboard
- Reports and analytics
- Notification system
- Document management

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

#### Method 2: Direct CLI (Debugging)

```bash
# Basic task
codex exec --json --output-last-message /tmp/result.json "What is 2+2?"

# Code review
codex exec review

# Check result
cat /tmp/result.json
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

### Verification Checklist

Use this checklist to verify your Codex MCP setup:

- [ ] Codex extension installed in VSCode
- [ ] `codex login status` shows "Logged in"
- [ ] `.mcp.json` configured with correct codex.exe path
- [ ] `connectionTimeout` set to 60000ms
- [ ] Claude Code settings include `mcp__codex*` permissions
- [ ] Claude Code restarted after configuration
- [ ] `ToolSearch("mcp__codex")` returns tools
- [ ] Test task executes successfully
- [ ] Response received in < 30 seconds

### Session Management

**Thread IDs:**
- Format: `019c6484-6e31-7ae3-8e9a-6f8972df15aa`
- Preserves conversation context
- Required for multi-turn conversations
- Auto-generated by `mcp__codex__codex`

**Process Verification:**
```bash
# Check Codex processes
ps -aW | grep -E "(codex|mcp-server)"
```

Expected output:
```
12345  ...  codex.exe
12346  ...  mcp-server-windows-x64.exe
```

### Maintenance

#### After Extension Updates

When the ChatGPT extension updates, the version number in the path changes:

```bash
# Check installed versions
ls "C:\Users\user\.vscode\extensions\" | grep chatgpt

# Update path in .mcp.json
# Example: openai.chatgpt-0.4.74-win32-x64 → openai.chatgpt-0.4.75-win32-x64
```

#### Configuration Backup

Keep a backup of your working `.mcp.json`:

```bash
cp C:\Users\user\.mcp.json C:\Users\user\.mcp.json.backup
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **API**: tRPC v11 (Type-safe APIs)
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: Biome
- **Containerization**: Docker Compose

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
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utility functions
│   │   ├── trpc.ts        # tRPC client setup
│   │   └── utils.ts       # Utilities (cn, etc.)
│   ├── modules/           # Domain modules
│   │   ├── identity/      # Auth, users, roles
│   │   ├── project/       # Projects, milestones
│   │   ├── issue/         # Issues, comments
│   │   ├── plm/           # Products, BOMs
│   │   ├── document/      # Documents, versions
│   │   ├── notification/  # Notifications
│   │   └── reporting/     # Reports, dashboards
│   └── server/            # Server-side code
│       ├── db/            # Database setup
│       └── trpc/          # tRPC server setup
└── tests/                 # Test files
    ├── unit/              # Vitest unit tests
    ├── integration/       # Integration tests
    └── e2e/               # Playwright E2E tests
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Docker (for PostgreSQL)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start PostgreSQL database:
```bash
docker compose -f docker/docker-compose.yml up -d
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Run database migrations (when implemented):
```bash
pnpm db:push
```

5. Start development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Check code with Biome
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Biome

### Database
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio

### Testing
- `pnpm test` - Run unit tests (Vitest)
- `pnpm test:ui` - Run Vitest with UI
- `pnpm test:e2e` - Run E2E tests (Playwright)
- `pnpm test:e2e:ui` - Run Playwright with UI

## Architecture

### Type-Safe API with tRPC

The project uses tRPC for end-to-end type safety between client and server:

```typescript
// Server-side router definition
export const appRouter = router({
  health: healthRouter,
});

// Client-side usage with full autocomplete
const { data } = trpc.health.check.useQuery();
```

### Database with Drizzle ORM

Drizzle ORM provides a TypeScript-native ORM with excellent performance:

```typescript
// Type-safe queries
const users = await db.select().from(usersTable);
```

### Modular Architecture

The codebase is organized into domain modules:

- **identity**: Authentication, users, roles, permissions
- **project**: Projects, milestones, tasks
- **issue**: Issue tracking, comments, labels
- **plm**: Products, BOMs, change requests
- **document**: Documents, versions, templates
- **notification**: Notifications, preferences
- **reporting**: Reports, dashboards, metrics

## Quality Standards

This project follows TRUST 5 principles:

- **Tested**: 85%+ test coverage target
- **Readable**: Clear naming, English comments
- **Unified**: Consistent formatting with Biome
- **Secured**: OWASP compliance, input validation
- **Trackable**: Conventional commits, issue references

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `TRPC_SERVER_URL` - tRPC server URL
- `NEXT_PUBLIC_APP_URL` - Application base URL

## Contributing

1. Create a feature branch from `main`
2. Implement your changes following TRUST 5 principles
3. Ensure all tests pass
4. Submit a pull request

## License

MIT License - see LICENSE file for details