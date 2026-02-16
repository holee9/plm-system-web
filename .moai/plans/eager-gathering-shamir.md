# 구현 계획: SPEC-PLM-001

## Context

사용자가 PLM System Web 프로젝트의 구현을 시작하려 합니다. **SPEC-PLM-001 (프로젝트 스캐폴딩 및 아키텍처 셋업)**을 먼저 구현합니다.

---

## SPEC-PLM-001 개요

프로젝트 스캐폴딩: Next.js 15 풀스택 모듈러 모놀리스 아키텍처의 초기 환경 구성

### 핵심 산출물
- Next.js 15 프로젝트 구조
- tRPC v11 API 레이어
- Drizzle ORM + PostgreSQL 16
- Docker Compose 개발 환경
- Biome, Vitest, Playwright 테스트 설정
- shadcn/ui + Tailwind CSS 4

---

## 구현 파일 목록

### 신규 생성 파일 (~25개)

| 파일 경로 | 설명 |
|----------|------|
| `package.json` | 의존성, 스크립트 |
| `tsconfig.json` | TypeScript strict 설정 |
| `next.config.ts` | Next.js 15 설정 |
| `biome.json` | Biome 린터/포매터 |
| `drizzle.config.ts` | Drizzle ORM 설정 |
| `vitest.config.ts` | Vitest 테스트 설정 |
| `playwright.config.ts` | Playwright E2E 설정 |
| `tailwind.config.ts` | Tailwind CSS 4 설정 |
| `.env.example` | 환경변수 템플릿 |
| `.gitignore` | Git ignore |
| `docker/docker-compose.yml` | PostgreSQL 16 |
| `src/app/layout.tsx` | Root Layout |
| `src/app/page.tsx` | Home Page |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC Handler |
| `src/server/db/index.ts` | Drizzle 클라이언트 |
| `src/server/db/schema.ts` | Schema barrel |
| `src/server/trpc/index.ts` | tRPC init |
| `src/server/trpc/router.ts` | Root Router |
| `src/server/trpc/context.ts` | tRPC Context |
| `src/server/trpc/procedures.ts` | Base Procedures |
| `src/lib/trpc.ts` | tRPC React Client |
| `src/lib/utils.ts` | 유틸리티 |
| `src/components/ui/button.tsx` | shadcn/ui 기본 |
| `tests/unit/setup.ts` | Vitest 셋업 |
| `tests/unit/trpc.test.ts` | tRPC 테스트 |

### 모듈 디렉토리 (뼈 디렉토리 생성)

| 디렉토리 | 설명 |
|----------|------|
| `src/modules/identity/` | 인증 모듈 |
| `src/modules/project/` | 프로젝트 모듈 |
| `src/modules/issue/` | 이슈 모듈 |
| `src/modules/plm/` | PLM 모듈 |
| `src/modules/document/` | 문서 모듈 |
| `src/modules/notification/` | 알림 모듈 |
| `src/modules/reporting/` | 리포팅 모듈 |

---

## 기술 스택

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "drizzle-orm": "latest",
    "postgres": "latest",
    "zod": "^3.23.0",
    "zustand": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "@types/node": "^22",
    "@types/react": "^19",
    "drizzle-kit": "latest",
    "@biomejs/biome": "latest",
    "vitest": "latest",
    "@vitejs/plugin-react": "latest",
    "@playwright/test": "latest",
    "@testing-library/react": "latest"
  }
}
```

---

## 실행 순서

### 1단계: 프로젝트 초기화
```bash
# pnpm 프로젝트 초기화
pnpm init
pnpm install
```

### 2단계: 설정 파일 생성
```bash
# TypeScript, Next.js, Biome, Drizzle, Vitest, Playwright 설정
```

### 3단계: 디렉토리 구조 생성
```bash
# src/ 디렉토리 구조 생성
mkdir -p src/modules/{identity,project,issue,plm,document,notification,reporting}
mkdir -p src/server/{db,trpc}
mkdir -p src/app/api/trpc/[trpc]
mkdir -p src/{lib,components}
mkdir -p tests/{unit,integration,e2e}
```

### 4단계: Docker 환경
```bash
# docker/docker-compose.yml 생성
docker compose up -d
```

### 5단계: Drizzle 설정
```bash
# DB 스키마 푸시
pnpm db:push
```

### 6단계: 검증
```bash
pnpm dev    # 개발 서버 시작
pnpm lint  # 린팅
pnpm test  # 테스트
```

---

## 검증

### AC-001: Given 프로젝트가 클론되었을 때, When pnpm install을 실행하면, Then 에러 없이 모든 의존성이 설치된다
### AC-002: Given Docker가 설치되어 있을 때, When docker compose up -d를 실행하면, Then PostgreSQL 16 컨테이너가 실행된다
### AC-003: Given 의존성이 설치되었을 때, When pnpm dev를 실행하면, Then localhost:3000에서 Next.js 앱이 실행된다
### AC-004: Given 개발 서버가 실행 중일 때, When /api/trpc/health.check를 호출하면, Then { status: "ok" } 응답을 반환한다

---

## Codex 작업 가능 시점

### SPEC-PLM-001 완료 후 Codex 작업 가능

SPEC-PLM-001(스캐폴딩) 완료 후, shadcn/ui 기본 컴포넌트가 설치되면 **Codex 작업이 가능**합니다:

```
SPEC-PLM-001 완료
    ↓
shadcn/ui 설치 완료
    ↓
[Codex 작업 가능 시점]
```

### 이후 SPEC별 Codex 작업 시점

```
각 SPEC 별로:

Phase 1: Claude Code (Backend) → 완료
    ↓
[Codex 작업 가능 시점] ← 여기서 사용자 선택
    ↓
Phase 2: Codex (Frontend) → 작업 시작
    ↓
Phase 3: Claude Code (리뷰/통합)
```

---

## 사용자 선택 항목 (Codex 작업 가능 시점)

SPEC-PLM-001 완료 후, 또는 각 SPEC의 Backend 구현 완료 후:

```markdown
🤖 MoAI ★ Codex 작업 가능 ─────────────────
📋 Backend 구현 완료
⏳ Codex로 Frontend 구현을 시작하시겠습니까?
────────────────────────────────────────────

옵션:
1. shadcn/ui 컴포넌트 추가 설치 (권장)
   - Button, Input, Dialog, Table 등 기본 컴포넌트 설치
   - Codex 작업 전에 먼저 설치하는 것을 권장

2. 바로 Codex에 UI 구현 지시 (빠른 시작)
   - 현재 설치된 shadcn/ui만 사용
   - 필요한 컴포넌트는 Codex가 직접 구현

3. 일단 Claude Code로 계속 진행
   - 추가 SPEC 구현 후 Codex 작업
   - 나중에 한꺐서 Codex 작업

4. UI는 직접 구현
   - Codex 없이 Claude Code가 직접 UI 구현
```

---

## Codex 작업 지시 명령어

사용자가 **"바로 Codex에 UI 구현 지시"**를 선택할 때 VS Code Codex Extension에게 지시하는 명령어:

```markdown
@Codex

# 작업: [SPEC-XXX] UI 구현

## 🔒 HARD CONSTRAINTS (작업 제약)

당신은 오직 Frontend UI/UX만 구현합니다:

❌ **절대 금지**:
- src/modules/**/*.ts 수정 (Backend는 Claude Code)
- src/server/**/*.ts 수정
- src/lib/trpc.ts 수정 (tRPC 설정은 읽기만)
- tests/** 수정

✅ **허용됨**:
- src/app/**/*.tsx 생성/수정
- src/components/**/*.tsx 생성/수정
- src/hooks/use*.ts 생성/수정
- src/styles/** 생성/수정

## 📋 API (읽기만 가능)

### tRPC 사용법
\`\`\`typescript
// src/lib/trpc.ts를 통해 호출
const trpc = createTRPCContext<AppRouter>();

// 예시
trpc.issues.list.useQuery(...)
trpc.issues.create.useMutation(...)
\`\`\`

### 타입 참조
\`\`\`typescript
// src/modules/*/types.ts 읽기만 가능
interface Issue { ... }
\`\`\`

## 🎯 구현 파일
1. [파일 경로]
2. [파일 경로]
3. ...

## ✅ 작업 완료 후 확인
- [ ] shadcn/ui 사용
- [ ] Tailwind CSS 스타일링
- [ ] trpc.*.useQuery() 또는 useMutation()만 사용
- [ ] Backend 로직 없음
- [ ] TypeScript 에러 없음
```
