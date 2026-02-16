# Claude Code + Codex 협업 구현 계획

## 개요

본 계획은 Claude Code와 Codex의 전문 영역을 기반으로 PLM System Web 구현 작업을 효율적으로 분담합니다.

## 작업 분담 원칙

### Claude Code (MoAI) 영역 - 파일 시스템, 아키텍처, 인프라

- **강점**: 프로젝트 전체 구조, 파일 시스템, 도구 통합
- **담당**: 스캐폴딩, 설정, 인프라, 구조

### Codex 영역 - 비즈니스 로직, 알고리즘, 복잡한 코드

- **강점**: 코드 생성, 알고리즘, 리팩토링, 테스트
- **담당**: 로직, 계산, 상태 처리, 검증

---

## SPEC별 구현 계획

### SPEC-PLM-001: 프로젝트 스캐폴딩

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | 폴더 구조 생성 | Claude Code | mkdir -p src/modules/{identity,project,issue,plm,document,notification,reporting} |
| 2 | Drizzle 설정 | Claude Code | npx drizzle-kit init |
| 3 | 환경 변수 설정 | Claude Code | .env.example 작성 |
| 4 | Biome 린팅 설정 | Claude Code | biome.json 구성 |
| 5 | Docker Compose | Claude Code | docker/docker-compose.yml 작성 |

### SPEC-PLM-002: 인증 및 사용자 관리

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | DB 스키마 작성 | Claude Code | users, accounts, sessions, teams, team_members 테이블 |
| 2 | Auth.js 설정 | Claude Code | @auth/core 구성 |
| 3 | RBAC 정책 구현 | **Codex** | "Implement RBAC permission evaluation with role inheritance" |
| 4 | 팀 멤버 검증 로직 | **Codex** | "Write validation logic for team membership checks" |
| 5 | 인증 tRPC 프로시저 | Claude Code | router에 auth 프로시저 추가 |

### SPEC-PLM-003: 프로젝트 CRUD

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | 프로젝트 테이블 스키마 | Claude Code | projects, project_members |
| 2 | CRUD tRPC 프로시저 | Claude Code | 프로젝트 생성, 조회, 수정, 삭제 |
| 3 | 멤버 초대 로직 | **Codex** | "Implement member invitation workflow with email verification" |
| 4 | 권한 체크 미들웨어 | **Codex** | "Create middleware to check project access permissions" |
| 5 | 프로젝트 React 컴포넌트 | Claude Code | ProjectList, ProjectDetail 페이지 |

### SPEC-PLM-004: 이슈 추적

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | 이슈 테이블 스키마 | Claude Code | issues, issue_comments, labels, issue_labels, milestones |
| 2 | 이슈 CRUD tRPC | Claude Code | 기본 CRUD 프로시저 |
| 3 | **상태 머신 로직** | **Codex** | "Implement issue state machine with transitions: todo→in_progress→done" |
| 4 | **칸반 보드 드래그앤드롭 로직** | **Codex** | "Write drag-and-drop logic for Kanban board with optimistic updates" |
| 5 | 이슈 React 컴포넌트 | Claude Code | IssueBoard, IssueDetail, KanbanColumn |
| 6 | 이슈 필터링 로직 | **Codex** | "Implement filtering logic for issues by label, assignee, milestone" |

### SPEC-PLM-005: BOM 및 부품 관리

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | PLM 테이블 스키마 | Claude Code | parts, revisions, bom_items |
| 2 | 기본 CRUD tRPC | Claude Code | 부품 CRUD |
| 3 | **BOM 트리 재귀 조회** | **Codex** | "Write recursive function to build BOM tree with quantity calculation" |
| 4 | **리비전 관리 로직** | **Codex** | "Implement revision control with parent-child relationships" |
| 5 | **BOM 비용 계산** | **Codex** | "Calculate total cost from BOM tree recursively" |
| 6 | BOM React 컴포넌트 | Claude Code | BomTree, PartList 페이지 |

### SPEC-PLM-006: 변경 주문 워크플로우

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | 변경 주문 테이블 | Claude Code | change_orders, change_order_approvals |
| 2 | 기본 CRUD | Claude Code | ECR/ECN CRUD |
| 3 | **워크플로우 엔진** | **Codex** | "Implement change order workflow with approval stages" |
| 4 | **승인 프로세스 로직** | **Codex** | "Write approval logic with parallel and sequential stages" |
| 5 | **영향도 분석** | **Codex** | "Create impact analysis for BOM changes" |
| 6 | 변경 주문 컴포넌트 | Claude Code | ChangeOrderList, ApprovalQueue |

### SPEC-PLM-007: 대시보드, 알림, 문서

| 단계 | 작업 | 담당 | 명령어/프롬프트 |
|------|------|------|----------------|
| 1 | 알림/문서 테이블 | Claude Code | notifications, activity_logs, documents, file_versions |
| 2 | SSE 알림 설정 | Claude Code | 서버 센트 이벤트 구성 |
| 3 | **대시보드 집계 로직** | **Codex** | "Write aggregation queries for dashboard statistics" |
| 4 | **알림 우선순위 로직** | **Codex** | "Implement notification priority scoring algorithm" |
| 5 | 대시보드 컴포넌트 | Claude Code | Dashboard, NotificationList |
| 6 | 문서 업로드 핸들러 | Claude Code | 파일 업로드 API |

---

## Codex 위임 패턴

### 1. CLI 직접 실행 (즉시 사용)

```bash
# Claude Code에서 Bash 도구로 실행
"C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64\bin\windows-x86_64\codex.exe" \
  exec --json --output-last-message /tmp/result.json "[TASK_DESCRIPTION]"
```

### 2. MCP 도구 사용 (세션 재시작 후)

```javascript
// Claude Code 세션 재시작 후 MCP 도구 자동 로드
// ToolSearch로 도구 발견: mcp__codex__*
```

### 3. 코드 검증 플로우

1. Claude Code: Codex에 작업 위임
2. Codex: 코드 생성 후 결과 반환
3. Claude Code: 결과 검토 → 파일 통합 → 테스트 실행
4. 실패 시: 피드백과 함께 재위임

---

## 통합 예시: BOM 트리 구현

### 1단계: Claude Code - 스키마 및 구조

```typescript
// src/server/db/schema/plm.ts - Claude Code 작성
import { pgTable, ... } from 'drizzle-orm/pg-core';

export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  // ...
});

export const bomItems = pgTable('bom_items', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').references(() => parts.id),
  childId: integer('child_id').references(() => parts.id),
  quantity: integer('quantity').notNull(),
});
```

### 2단계: Codex - 재귀 로직 구현

```bash
# Claude Code에서 Codex에 위임
codex exec --json --output-last-message /tmp/bom_tree.json "
Create a TypeScript function that recursively builds a BOM tree:
- Input: partId
- Output: Tree structure with nested children and calculated quantities
- Use Drizzle ORM for queries
- Handle circular references safely
- Return type: { part: Part, quantity: number, children: BomNode[] }[]
"
```

### 3단계: Claude Code - 결과 통합

```typescript
// src/modules/plm/bom-tree.ts - Codex 결과 통합
import { parts, bomItems } from '@/server/db/schema';
import { db } from '@/server/db';
// [Codex가 생성한 코드를 여기에 통합]
```

### 4단계: Claude Code - 테스트

```typescript
// tests/modules/plm/bom-tree.test.ts
import { describe, it, expect } from 'vitest';
import { buildBomTree } from '@/modules/plm/bom-tree';

describe('BOM Tree', () => {
  it('should build tree with correct quantities', async () => {
    // Codex가 생성한 테스트 케이스 활용
  });
});
```

---

## 품질 관리 (TRUST 5)

### 검증 체크리스트

| 항목 | 검증자 | 기준 |
|------|--------|------|
| 타입 안전성 | Claude Code | TypeScript 컴파일 통과 |
| 코드 스타일 | Claude Code | Biome 린팅 통과 |
| 로직 정확성 | **Codex** | 테스트 케이스 작성 및 통과 |
| 엣지 케이스 | **Codex** | 경계 조건 테스트 작성 |
| 보안 | Claude Code | OWASP 체크리스트 |

---

## 다음 단계

1. **SPEC-PLM-001 구현 시작**: `/moai run SPEC-PLM-001`
2. **Codex 통합 검증**: `codex exec "What is 2+2?"` 테스트
3. **첫 번째 협업 작업**: BOM 트리 재귀 로직 (Codex) + 스키마 (Claude Code)

---

## 참고 자료

- Codex 경로: `C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64\bin\windows-x86_64\codex.exe`
- MCP 설정: `C:\Users\user\.mcp.json`
- 세션 ID: 추적용 UUID 기록
