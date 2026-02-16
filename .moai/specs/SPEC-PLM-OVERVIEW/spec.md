# SPEC-PLM-OVERVIEW: PLM System Web 전체 SPEC 개요

## Metadata

- ID: SPEC-PLM-OVERVIEW
- Status: Draft
- Priority: P1
- Created: 2026-02-15
- Author: MoAI (drake)

## 프로젝트 개요

PLM System Web은 웹 기반 프로젝트 관리 + PLM(Product Lifecycle Management) 통합 플랫폼입니다.
Next.js 15 풀스택 모듈러 모놀리스 아키텍처로 구현되며, 단일 개발자(drake) 환경에서 무료 우선(Free-first) 전략으로 개발합니다.

### 확정된 기술 스택 (기존 프로젝트 문서 대비 변경)

> 참고: `.moai/project/` 내의 product.md, structure.md, tech.md는 초기 NestJS + TypeORM 기반으로 작성되었으나,
> 실제 확정된 아키텍처는 아래와 같습니다.

| 계층 | 기술 | 버전 | 비고 |
|------|------|------|------|
| 프레임워크 | Next.js | 15 (App Router) | 풀스택 모듈러 모놀리스 |
| API 계층 | tRPC | v11 | End-to-end 타입 안전성 |
| ORM | Drizzle ORM | Latest | SQL-friendly, 경량 |
| DB | PostgreSQL | 16 | Neon Free (프로덕션) |
| 인증 | Auth.js | v5 | Session 기반 |
| UI | shadcn/ui + Tailwind CSS 4 | Latest | Lucide icons |
| 상태관리 | Zustand + TanStack Query | Latest | Client + Server state |
| 테스트 | Vitest + Playwright | Latest | Unit + E2E |
| 린팅 | Biome | Latest | ESLint/Prettier 대체 |
| 배포 | Vercel Free + Neon Free | - | Cloudflare R2/DNS |

---

## SPEC 목록 및 의존성 그래프

### 전체 SPEC 구성 (7개)

| SPEC ID | 제목 | 우선순위 | 크기 | 예상 파일 수 | 신규 테이블 |
|---------|------|----------|------|-------------|------------|
| SPEC-PLM-001 | 프로젝트 스캐폴딩 및 아키텍처 셋업 | P1 | M | ~25 | 0 |
| SPEC-PLM-002 | 인증 및 사용자 관리 | P1 | M | ~15 | 5 |
| SPEC-PLM-003 | 프로젝트 CRUD 및 관리 | P1 | M | ~12 | 2 |
| SPEC-PLM-004 | 이슈 추적 코어 | P1 | L | ~18 | 5 |
| SPEC-PLM-005 | BOM 및 부품 관리 (PLM) | P2 | L | ~14 | 3 |
| SPEC-PLM-006 | 변경 주문 워크플로우 (PLM) | P2 | L | ~12 | 2 |
| SPEC-PLM-007 | 대시보드, 리포팅, 알림, 문서 관리 | P2 | M | ~14 | 3 |
| **합계** | | | | **~110** | **20** |

### 의존성 그래프

```
SPEC-PLM-001 (스캐폴딩)
    |
    v
SPEC-PLM-002 (인증)
    |
    v
SPEC-PLM-003 (프로젝트)
    |
    +---------------------------+
    |                           |
    v                           v
SPEC-PLM-004 (이슈)      SPEC-PLM-005 (BOM/부품)
    |                           |
    |                           v
    |                     SPEC-PLM-006 (변경 주문)
    |                           |
    +---------------------------+
    |
    v
SPEC-PLM-007 (대시보드/알림/문서)
```

- SPEC-PLM-004와 SPEC-PLM-005는 **병렬 개발 가능** (둘 다 SPEC-PLM-003에만 의존)
- SPEC-PLM-007은 SPEC-PLM-004와 SPEC-PLM-006 완료 후 진행

---

## 구현 단계 (Phase)

### Phase 1: 기반 구축 (Primary Goal)

| 순서 | SPEC | 핵심 산출물 |
|------|------|------------|
| 1 | SPEC-PLM-001 | 개발 환경, 프로젝트 구조, Docker, CI |
| 2 | SPEC-PLM-002 | Auth.js 인증, 사용자/팀 관리, RBAC |
| 3 | SPEC-PLM-003 | 프로젝트 CRUD, 멤버 관리 |

### Phase 2: 핵심 기능 (Secondary Goal)

| 순서 | SPEC | 핵심 산출물 |
|------|------|------------|
| 4a | SPEC-PLM-004 | 이슈 CRUD, 상태 워크플로우, 칸반 |
| 4b | SPEC-PLM-005 | 부품/BOM 트리, 리비전 관리 |

> 4a와 4b는 병렬 개발 가능

### Phase 3: PLM 워크플로우 (Tertiary Goal)

| 순서 | SPEC | 핵심 산출물 |
|------|------|------------|
| 5 | SPEC-PLM-006 | ECR/ECN 워크플로우, 승인 프로세스 |

### Phase 4: 통합 및 완성 (Final Goal)

| 순서 | SPEC | 핵심 산출물 |
|------|------|------------|
| 6 | SPEC-PLM-007 | 대시보드, 알림, 파일 관리, 활동 피드 |

---

## 아키텍처 요약

### 모듈 구조

단일 Next.js 배포 내 7개 바운디드 컨텍스트 (`src/modules/`):

| 모듈 | 역할 | 소유 테이블 수 |
|------|------|---------------|
| identity | 인증 + 사용자 + 팀 | 5 |
| project | 프로젝트 관리 | 2 |
| issue | 이슈 추적 | 5 |
| plm | BOM + 변경 주문 | 5 |
| document | 파일/문서 | 2 |
| notification | 알림 + 활동 로그 | 2 |
| reporting | 대시보드 | 0 (다른 모듈 읽기) |

### 데이터베이스 스키마 총괄 (20 테이블)

**identity 모듈:**
- users, accounts, sessions, teams, team_members

**project 모듈:**
- projects, project_members

**issue 모듈:**
- issues, issue_comments, labels, issue_labels, milestones

**plm 모듈:**
- parts, revisions, bom_items, change_orders, change_order_approvals

**document 모듈:**
- documents, file_versions

**notification 모듈:**
- notifications, activity_logs

### 핵심 아키텍처 결정 (ADR)

1. **Modular Monolith over Microservices**: MVP 단계에서의 단순성 우선
2. **tRPC for E2E Type Safety**: REST API 계약 유지보수 불필요
3. **Drizzle ORM over TypeORM**: 더 가볍고, SQL-friendly, DX 우수
4. **In-process Event Bus**: 모듈 간 통신 (느슨한 결합)
5. **Local FS → Cloudflare R2**: 파일 스토리지 추상화 계층
6. **SSE for Real-time**: WebSocket보다 단순한 알림 구현

---

## 비기능 요구사항 (전체 적용)

- NFR-PERF-001: 페이지 로드 시간 1초 미만
- NFR-PERF-002: API 응답 시간 200ms 미만
- NFR-SCALE-001: 500명 이상 동시 접속 지원 (프로덕션)
- NFR-AVAIL-001: 가용성 99.9% 목표
- NFR-SEC-001: OWASP Top 10 준수
- NFR-A11Y-001: WCAG 2.1 AA 준수
- NFR-I18N-001: 한국어(주), 영어(부) 지원

---

## 개발 환경 구성

### Docker Compose 구성

- PostgreSQL 16-alpine: 포트 5432

### 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | Turbopack 개발 서버 |
| `pnpm db:push` | 스키마 동기화 |
| `pnpm db:generate` | 마이그레이션 생성 |
| `pnpm db:migrate` | 마이그레이션 실행 |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm test` | Vitest 실행 |
| `pnpm test:e2e` | Playwright 실행 |
| `pnpm lint` | Biome 린팅 |

---

## 전문가 컨설팅 권장

| SPEC | 권장 전문가 에이전트 | 사유 |
|------|---------------------|------|
| SPEC-PLM-001 | expert-devops | Docker, CI/CD 설정 |
| SPEC-PLM-002 | expert-backend, expert-security | 인증/보안 아키텍처 |
| SPEC-PLM-003 | expert-backend | API 설계, RBAC |
| SPEC-PLM-004 | expert-backend, expert-frontend | 상태 머신, 칸반 UI |
| SPEC-PLM-005 | expert-backend | 재귀 트리, 리비전 관리 |
| SPEC-PLM-006 | expert-backend | 워크플로우 엔진 |
| SPEC-PLM-007 | expert-frontend, expert-backend | 대시보드 UI, SSE |

---

## 다음 단계

1. `/moai run SPEC-PLM-001` 실행하여 프로젝트 스캐폴딩 구현
2. 각 SPEC는 순차적으로 또는 의존성 그래프에 따라 병렬 구현
3. 각 SPEC 완료 후 `/moai sync SPEC-PLM-XXX`로 문서 동기화
