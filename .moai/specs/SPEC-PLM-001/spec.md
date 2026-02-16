# SPEC-PLM-001: 프로젝트 스캐폴딩 및 아키텍처 셋업

## Metadata

- ID: SPEC-PLM-001
- Status: Draft
- Priority: P1
- Size: M
- Dependencies: 없음 (최초 SPEC)
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

Next.js 15 풀스택 모듈러 모놀리스 프로젝트의 초기 환경을 구성합니다.
개발 환경, 빌드 도구, 테스트 프레임워크, Docker 구성, CI/CD 파이프라인을 포함하며,
이후 모든 SPEC의 기반이 되는 프로젝트 구조를 확립합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: 시스템은 **항상** pnpm을 패키지 매니저로 사용하며, `pnpm install` 명령으로 모든 의존성을 설치할 수 있어야 한다
- FR-002: **WHEN** `pnpm dev` 명령이 실행되면 **THEN** Next.js 15 Turbopack 개발 서버가 localhost:3000에서 시작되어야 한다
- FR-003: **WHEN** `docker compose up` 명령이 실행되면 **THEN** PostgreSQL 16-alpine 컨테이너가 포트 5432에서 시작되어야 한다
- FR-004: **WHEN** tRPC 엔드포인트로 요청을 보내면 **THEN** 정상적인 응답을 반환해야 한다
- FR-005: **WHEN** Drizzle ORM이 초기화되면 **THEN** PostgreSQL 데이터베이스에 정상 연결되어야 한다
- FR-006: **WHEN** `pnpm lint` 명령이 실행되면 **THEN** Biome가 프로젝트 전체 린팅을 수행해야 한다
- FR-007: **WHEN** `pnpm test` 명령이 실행되면 **THEN** Vitest가 테스트를 실행하고 결과를 출력해야 한다
- FR-008: 시스템은 **항상** `src/modules/` 디렉토리 하위에 바운디드 컨텍스트별 모듈 구조를 유지해야 한다
- FR-009: **WHEN** `pnpm db:push` 명령이 실행되면 **THEN** Drizzle 스키마가 데이터베이스에 동기화되어야 한다
- FR-010: **WHEN** `pnpm db:studio` 명령이 실행되면 **THEN** Drizzle Studio가 브라우저에서 열려야 한다

### Non-Functional Requirements

- NFR-001: 시스템은 **항상** TypeScript strict 모드로 컴파일되어야 한다
- NFR-002: 시스템은 **항상** 환경변수를 `.env.local` 파일에서 관리하며, `.env.example` 템플릿을 제공해야 한다
- NFR-003: 시스템은 **항상** 경로 별칭(path aliases)으로 `@/`를 사용하여 `src/` 디렉토리를 참조해야 한다
- NFR-004: 시스템은 Windows, macOS, Linux에서 동일하게 동작해야 한다

---

## User Stories

- US-001: 개발자로서, `git clone` 후 `pnpm install && docker compose up -d && pnpm dev` 3개 명령으로 개발 환경을 시작할 수 있어야 한다, 그래야 빠르게 개발에 착수할 수 있다
- US-002: 개발자로서, 모듈별 독립적인 디렉토리 구조를 확인할 수 있어야 한다, 그래야 바운디드 컨텍스트 간 경계를 명확히 유지할 수 있다
- US-003: 개발자로서, tRPC 라우터의 타입이 클라이언트에서 자동 추론되어야 한다, 그래야 API 계약 유지보수 없이 개발할 수 있다

---

## Acceptance Criteria

- AC-001: Given 프로젝트가 클론되었을 때, When `pnpm install`을 실행하면, Then 에러 없이 모든 의존성이 설치된다
- AC-002: Given Docker가 설치되어 있을 때, When `docker compose up -d`를 실행하면, Then PostgreSQL 16 컨테이너가 healthy 상태로 실행된다
- AC-003: Given 의존성이 설치되었을 때, When `pnpm dev`를 실행하면, Then localhost:3000에서 Next.js 앱이 렌더링된다
- AC-004: Given 개발 서버가 실행 중일 때, When `/api/trpc/health.check` 엔드포인트를 호출하면, Then `{ status: "ok" }` 응답을 반환한다
- AC-005: Given PostgreSQL이 실행 중일 때, When Drizzle 연결 테스트를 실행하면, Then 정상 연결을 확인한다
- AC-006: Given 프로젝트가 설정되었을 때, When `pnpm lint`를 실행하면, Then Biome가 에러 없이 실행된다
- AC-007: Given 테스트 파일이 존재할 때, When `pnpm test`를 실행하면, Then Vitest가 모든 테스트를 통과시킨다
- AC-008: Given `src/modules/` 디렉토리를 확인할 때, When 7개 모듈 디렉토리를 검사하면, Then identity, project, issue, plm, document, notification, reporting 디렉토리가 존재한다

---

## Technical Design

### Module

- **모듈명**: scaffolding (전체 프로젝트 구조 설정)
- **역할**: 모든 후속 SPEC의 기반 인프라 제공

### 프로젝트 디렉토리 구조

```
plm-system-web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root Layout
│   │   ├── page.tsx                  # Home Page
│   │   ├── api/
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts      # tRPC HTTP Handler
│   │   └── (auth)/                   # Auth Route Group (SPEC-002)
│   ├── modules/                      # Bounded Contexts
│   │   ├── identity/                 # Auth + Users + Teams
│   │   │   ├── schemas/              # Drizzle schemas
│   │   │   ├── router.ts             # tRPC router
│   │   │   ├── service.ts            # Business logic
│   │   │   └── types.ts              # Module types
│   │   ├── project/                  # Project Management
│   │   ├── issue/                    # Issue Tracking
│   │   ├── plm/                      # BOM + Change Order
│   │   ├── document/                 # File/Document
│   │   ├── notification/             # Alerts + Activity
│   │   └── reporting/                # Dashboard (reads only)
│   ├── server/                       # Server-side utilities
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client
│   │   │   ├── schema.ts             # Schema barrel export
│   │   │   └── migrate.ts            # Migration runner
│   │   ├── trpc/
│   │   │   ├── index.ts              # tRPC init (initTRPC)
│   │   │   ├── router.ts             # Root router (appRouter)
│   │   │   ├── context.ts            # tRPC context
│   │   │   └── procedures.ts         # Base procedures
│   │   └── auth/                     # Auth.js config (SPEC-002)
│   ├── lib/                          # Shared client utilities
│   │   ├── trpc.ts                   # tRPC React client
│   │   ├── utils.ts                  # General utilities
│   │   └── constants.ts              # Constants
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/                   # Layout components
│   │   └── common/                   # Common components
│   ├── hooks/                        # Custom React hooks
│   └── types/                        # Global type definitions
├── drizzle/                          # Drizzle migrations output
├── docker/
│   └── docker-compose.yml            # PostgreSQL 16
├── public/                           # Static assets
├── tests/
│   ├── unit/                         # Vitest unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # Playwright E2E tests
├── .env.example                      # Environment template
├── .env.local                        # Local environment (gitignored)
├── biome.json                        # Biome config
├── drizzle.config.ts                 # Drizzle config
├── next.config.ts                    # Next.js config
├── package.json                      # Dependencies
├── pnpm-lock.yaml                    # Lock file
├── tsconfig.json                     # TypeScript config
├── vitest.config.ts                  # Vitest config
├── playwright.config.ts              # Playwright config
└── tailwind.config.ts                # Tailwind CSS 4 config
```

### 핵심 설정 파일 구성

**package.json 주요 의존성:**

```
dependencies:
  next: ^15.x
  react: ^19.x
  react-dom: ^19.x
  @trpc/server: ^11.x
  @trpc/client: ^11.x
  @trpc/react-query: ^11.x
  @tanstack/react-query: ^5.x
  drizzle-orm: latest
  postgres: latest (PostgreSQL driver)
  @auth/core: ^0.x (Auth.js v5)
  @auth/drizzle-adapter: latest
  zod: ^3.23
  zustand: ^5.x
  tailwindcss: ^4.x
  lucide-react: latest
  class-variance-authority: latest
  clsx: latest
  tailwind-merge: latest

devDependencies:
  typescript: ^5.7
  @types/node: ^22
  @types/react: ^19
  drizzle-kit: latest
  @biomejs/biome: latest
  vitest: latest
  @vitejs/plugin-react: latest
  @playwright/test: latest
  @testing-library/react: latest
```

### tRPC 설정

```typescript
// src/server/trpc/index.ts
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
```

### Drizzle ORM 설정

```typescript
// src/server/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### Docker Compose

```yaml
# docker/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: plm_user
      POSTGRES_PASSWORD: plm_password
      POSTGRES_DB: plm_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U plm_user -d plm_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## Edge Cases & Risks

- EC-001: 포트 충돌 - 3000(Next.js), 5432(PostgreSQL)가 이미 사용 중인 경우 -> `.env.local`에서 포트 변경 가능하도록 설계
- EC-002: Node.js 버전 불일치 - `.nvmrc` 또는 `package.json`의 engines 필드로 최소 버전 명시
- EC-003: pnpm 미설치 - `README.md`에 설치 가이드 포함, `corepack enable` 안내
- RISK-001: Next.js 15 + tRPC v11 호환성 미검증 -> 초기 통합 테스트로 검증 (영향: 높음)
- RISK-002: Tailwind CSS 4 breaking changes -> shadcn/ui 공식 Tailwind 4 지원 확인 필요 (영향: 중간)
- RISK-003: Drizzle ORM + Auth.js Adapter 호환성 -> SPEC-002 착수 전 검증 필요 (영향: 중간)

---

## Files to Create/Modify

### 신규 생성 파일 (~25개)

| 파일 경로 | 설명 |
|----------|------|
| `package.json` | 루트 패키지 설정, 의존성, 스크립트 |
| `tsconfig.json` | TypeScript strict 설정 |
| `next.config.ts` | Next.js 15 설정 |
| `biome.json` | Biome 린터/포매터 설정 |
| `drizzle.config.ts` | Drizzle ORM 설정 |
| `vitest.config.ts` | Vitest 테스트 설정 |
| `playwright.config.ts` | Playwright E2E 설정 |
| `tailwind.config.ts` | Tailwind CSS 4 설정 |
| `.env.example` | 환경변수 템플릿 |
| `.gitignore` | Git ignore 규칙 |
| `docker/docker-compose.yml` | PostgreSQL 16 Docker 설정 |
| `src/app/layout.tsx` | Root Layout |
| `src/app/page.tsx` | Home Page |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP Handler |
| `src/server/db/index.ts` | Drizzle 클라이언트 |
| `src/server/db/schema.ts` | 스키마 barrel export |
| `src/server/trpc/index.ts` | tRPC 초기화 |
| `src/server/trpc/router.ts` | Root Router |
| `src/server/trpc/context.ts` | tRPC Context |
| `src/server/trpc/procedures.ts` | Base Procedures |
| `src/lib/trpc.ts` | tRPC React Client |
| `src/lib/utils.ts` | 유틸리티 (cn 함수 등) |
| `src/components/ui/button.tsx` | shadcn/ui 기본 컴포넌트 |
| `tests/unit/setup.ts` | Vitest 셋업 |
| `tests/unit/trpc.test.ts` | tRPC health check 테스트 |

### 모듈 디렉토리 (빈 디렉토리 + index.ts)

| 디렉토리 | 설명 |
|----------|------|
| `src/modules/identity/` | 인증 모듈 뼈대 |
| `src/modules/project/` | 프로젝트 모듈 뼈대 |
| `src/modules/issue/` | 이슈 모듈 뼈대 |
| `src/modules/plm/` | PLM 모듈 뼈대 |
| `src/modules/document/` | 문서 모듈 뼈대 |
| `src/modules/notification/` | 알림 모듈 뼈대 |
| `src/modules/reporting/` | 리포팅 모듈 뼈대 |

---

## Testing Strategy

### Unit Tests

- tRPC health check 응답 검증
- Drizzle 클라이언트 초기화 검증
- 유틸리티 함수 (cn, etc.) 테스트

### Integration Tests

- tRPC Router -> PostgreSQL 연결 테스트
- Drizzle schema push 동작 검증

### E2E Tests

- 홈페이지 렌더링 확인
- tRPC API 호출 -> 응답 검증
