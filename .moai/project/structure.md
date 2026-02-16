# PLM System Web - 프로젝트 구조 설계

## 프로젝트 구조 개요

PLM System Web는 모듈형 모놀리식 아키텍처(Modular Monolithic Architecture)를 기반으로 설계되었습니다. 도메인 주도 설계(Domain-Driven Design) 패턴을 따라 7개의 도메인 모듈로 구성되며, 각 모듈은 독립적으로 개발하고 유지보수할 수 있습니다.

```
plm-system-web/
├── .moai/                  # MoAI 프레임워크 설정 및 SPEC 문서
├── docker/                 # Docker Compose 설정 (PostgreSQL 16 + pgAdmin)
├── docs/                   # 프로젝트 문서
├── drizzle/                # Drizzle ORM 마이그레이션 파일
├── src/                    # 소스 코드 (핵심)
│   ├── app/                # Next.js 15 App Router 페이지
│   ├── components/         # React 19 컴포넌트 (58개)
│   ├── hooks/              # 커스텀 React Hook
│   ├── lib/                # 유틸리티 및 설정
│   ├── modules/            # 7개 도메인 모듈
│   ├── server/             # 서버사이드 코드 (tRPC + Drizzle)
│   ├── stores/             # Zustand 상태 관리
│   └── utils/              # 유틸리티 함수
├── tests/                  # Vitest 단위 테스트 + Playwright E2E 테스트
├── .env.example            # 환경변수 템플릿
├── .gitignore              # Git 무시 파일
├── biome.json              # Biome 설정 (린팅/포맷팅)
├── drizzle.config.ts       # Drizzle ORM 설정
├── next.config.ts          # Next.js 설정
├── package.json            # 프로젝트 의존성
├── playwright.config.ts    # Playwright E2E 테스트 설정
├── tailwind.config.ts      # Tailwind CSS 4 설정
├── tsconfig.json           # TypeScript 5.7 설정
└── vitest.config.ts        # Vitest 테스트 설정
```

## 상세 디렉토리 구조

### src/app/ - Next.js App Router

**목적**: Next.js 15 App Router 기반의 페이지 및 라우팅

**구조**:
```
src/app/
├── (auth)/                 # 인증 관련 페이지 (그룹 라우트)
│   ├── login/
│   │   └── page.tsx        # 로그인 페이지
│   └── register/
│       └── page.tsx        # 회원가입 페이지
├── api/trpc/[trpc]/        # tRPC API 핸들러
│   └── route.ts            # tRPC 서버 엔드포인트
├── dashboard/              # 대시보드
│   └── page.tsx            # 메인 대시보드
├── identity/               # 신원 관리
│   └── page.tsx            # 사용자 프로필
├── issue/                  # 이슈 관리
│   └── page.tsx            # 이슈 목록 및 칸반 보드
├── plm/                    # PLM 관리
│   └── page.tsx            # BOM, 변경 관리
├── project/                # 프로젝트 관리
│   ├── page.tsx            # 프로젝트 목록
│   └── [id]/
│       └── page.tsx        # 프로젝트 상세
├── projects/               # 프로젝트 상세 페이지 (그룹 라우트)
│   ├── [key]/
│   │   ├── page.tsx        # 프로젝트 개요
│   │   ├── dashboard/
│   │   │   └── page.tsx    # 프로젝트 대시보드
│   │   ├── issues/
│   │   │   └── page.tsx    # 프로젝트 이슈
│   │   ├── parts/
│   │   │   └── page.tsx    # BOM 관리
│   │   └── changes/
│   │       └── page.tsx    # 변경 관리
│   └── page.tsx            # 전체 프로젝트 목록
├── layout.tsx              # 루트 레이아웃
└── page.tsx                # 홈 페이지
```

**주요 파일**:
- `layout.tsx`: 루트 레이아웃, Navbar, Sidebar 포함
- `page.tsx`: 홈 페이지, 대시보드 카드 및 시스템 건전성 모니터
- `api/trpc/[trpc]/route.ts`: tRPC API 핸들러

### src/components/ - React 컴포넌트

**목적**: 재사용 가능한 React 19 컴포넌트 (총 58개)

**구조**:
```
src/components/
├── ui/                     # shadcn/ui 기반 컴포넌트 (20개)
│   ├── avatar.tsx          # 사용자 아바타
│   ├── badge.tsx           # 배지 컴포넌트
│   ├── button.tsx          # 버튼
│   ├── card.tsx            # 카드
│   ├── checkbox.tsx        # 체크박스
│   ├── dialog.tsx          # 다이얼로그
│   ├── dropdown-menu.tsx   # 드롭다운 메뉴
│   ├── form.tsx            # 폼 컴포넌트
│   ├── input.tsx           # 입력 필드
│   ├── label.tsx           # 라벨
│   ├── loading-skeleton.tsx# 로딩 스켈레톤
│   ├── page-transition.tsx # 페이지 전환 애니메이션
│   ├── radio-group.tsx     # 라디오 그룹
│   ├── select.tsx          # 선택 드롭다운
│   ├── sheet.tsx           # 사이드 시트
│   ├── skip-link.tsx       # 스킵 링크 (접근성)
│   ├── table.tsx           # 테이블
│   ├── tabs.tsx            # 탭
│   ├── textarea.tsx        # 텍스트 영역
│   ├── toast.tsx           # 토스트 알림
│   └── toaster.tsx         # 토스트 컨테이너
├── auth/                   # 인증 관련 컴포넌트
│   ├── EmailVerification.tsx
│   ├── LoadingSpinner.tsx
│   ├── LoginPage.tsx
│   ├── PasswordResetForm.tsx
│   ├── ProtectedRoute.tsx
│   ├── RegisterPage.tsx
│   └── SessionManager.tsx
├── dashboard/              # 대시보드 컴포넌트
│   ├── activity-feed.tsx   # 활동 피드
│   ├── dashboard-content.tsx
│   ├── index.ts
│   ├── project-card.tsx    # 프로젝트 카드
│   ├── stat-card.tsx       # 통계 카드
│   └── system-health.tsx   # 시스템 건전성 모니터
├── issue/                  # 이슈 관리 컴포넌트
│   ├── index.ts
│   ├── issue-board.tsx     # 이슈 보드
│   ├── issue-card.tsx      # 이슈 카드
│   ├── issue-create-dialog.tsx
│   ├── issue-detail-dialog.tsx
│   ├── issue-filters.tsx   # 이슈 필터
│   ├── kanban-board.tsx    # 칸반 보드
│   ├── kanban-column.tsx   # 칸반 컬럼
│   └── sortable-item.tsx   # 정렬 가능한 아이템
├── layout/                 # 레이아웃 컴포넌트
│   ├── navbar.tsx          # 내비게이션 바
│   ├── sidebar.tsx         # 사이드바
│   ├── theme-toggle.tsx    # 테마 토글
│   └── user-menu.tsx       # 사용자 메뉴
├── plm/                    # PLM 관리 컴포넌트
│   ├── approval-timeline.tsx
│   ├── bom-filters.tsx     # BOM 필터
│   ├── bom-table.tsx       # BOM 테이블
│   ├── cad-file-list.tsx   # CAD 파일 목록
│   ├── change-history.tsx  # 변경 이력
│   ├── index.ts
│   ├── plm-stats.tsx       # PLM 통계
│   └── status-badge.tsx    # 상태 배지
├── project/                # 프로젝트 관리 컴포넌트
│   ├── activity-feed.tsx   # 활동 피드
│   ├── gantt-chart.tsx     # Gantt 차트
│   ├── index.ts
│   ├── issue-table.tsx     # 이슈 테이블
│   ├── project-header.tsx  # 프로젝트 헤더
│   └── team-list.tsx       # 팀 목록
├── theme-provider.tsx      # 테마 프로바이더
└── ui/
    ├── index.ts
    └── use-toast.ts        # 토스트 훅
```

**컴포넌트 분류**:
- **UI 기본** (20개): shadcn/ui 기반, Radix UI 프리미티브
- **인증** (7개): 로그인, 회원가입, 비밀번호 재설정
- **대시보드** (6개): 통계, 활동 피드, 시스템 모니터
- **이슈** (9개): 칸반 보드, 이슈 카드, 필터
- **레이아웃** (4개): 내비게이션, 사이드바, 테마
- **PLM** (8개): BOM, 변경 관리, CAD 파일
- **프로젝트** (6개): Gantt 차트, 팀 목록, 활동 피드

### src/modules/ - 도메인 모듈

**목적**: DDD 기반의 7개 도메인 모듈

**구조**:
```
src/modules/
├── identity/               # 신원 관리 도메인
│   ├── index.ts            # 모듈 진입점
│   ├── user.ts             # 사용자 엔티티
│   ├── role.ts             # 역할 엔티티
│   ├── permission.ts       # 권한 엔티티
│   └── auth.ts             # 인증 로직
├── project/                # 프로젝트 관리 도메인
│   ├── index.ts
│   ├── project.ts          # 프로젝트 엔티티
│   ├── milestone.ts        # 마일스톤 엔티티
│   └── task.ts             # 태스크 엔티티
├── issue/                  # 이슈 관리 도메인
│   ├── index.ts
│   ├── issue.ts            # 이슈 엔티티
│   ├── issue-comment.ts    # 이슈 댓글 엔티티
│   └── issue-label.ts      # 이슈 라벨 엔티티
├── plm/                    # PLM 도메인
│   ├── index.ts
│   ├── product.ts          # 제품 엔티티
│   ├── bom.ts              # BOM 엔티티
│   └── change-request.ts   # 변경 요청 엔티티
├── document/               # 문서 관리 도메인
│   ├── index.ts
│   ├── document.ts         # 문서 엔티티
│   ├── document-template.ts
│   └── document-version.ts
├── notification/           # 알림 도메인
│   ├── index.ts
│   ├── notification.ts
│   ├── notification-preference.ts
│   └── notification-template.ts
└── reporting/              # 리포팅 도메인
    ├── index.ts
    ├── report.ts
    ├── dashboard.ts
    └── metric.ts
```

**도메인 모듈 원칙**:
- 각 모듈은 독립적인 비즈니스 로직 포함
- 모듈 간 의존성 최소화
- 타입세이프한 엔티티 정의
- 재사용 가능한 도메인 로직

### src/server/ - 서버사이드 코드

**목적**: tRPC API 라우터 및 Drizzle ORM 데이터베이스 계층

**구조**:
```
src/server/
├── db/                     # Drizzle ORM 데이터베이스 계층
│   ├── index.ts            # 데이터베이스 클라이언트
│   ├── schema.ts           # Drizzle 스키마 정의
│   ├── issues.ts           # 이슈 테이블
│   ├── users.ts            # 사용자 테이블
│   ├── sessions.ts         # 세션 테이블
│   ├── auth_events.ts      # 인증 이력 테이블
│   ├── roles.ts            # 역할 테이블
│   ├── email_verification_tokens.ts
│   └── password_reset_tokens.ts
├── trpc/                   # tRPC v11 API 계층
│   ├── index.ts            # tRPC 서버 초기화
│   ├── router.ts           # 메인 앱 라우터
│   ├── context.ts          # tRPC 컨텍스트
│   ├── procedures.ts       # 재사용 프로시저
│   ├── middleware/         # tRPC 미들웨어
│   │   ├── index.ts
│   │   ├── authorization.ts
│   │   └── is-authed.ts
│   └── routers/            # 도메인별 라우터
│       ├── health.ts       # 헬스체크
│       ├── auth.ts         # 인증 라우터
│       ├── user.ts         # 사용자 라우터
│       └── issue.ts        # 이슈 라우터
└── utils/                  # 서버 유틸리티
    ├── jwt.ts              # JWT 유틸리티
    └── password.ts         # 비밀번호 해싱
```

**특징**:
- **타입세이프 API**: tRPC v11로 엔드투엔드 타입 안전성
- **데이터베이스 퍼스트**: Drizzle ORM으로 타입세이프 쿼리
- **미들웨어 체인**: 인증, 권한 체크 등 재사용 가능한 미들웨어
- **컨텍스트 주입**: 세션, 사용자 정보 등 컨텍스트 자동 주입

### src/hooks/ - React Hook

**구조**:
```
src/hooks/
├── use-auth.ts             # 인증 상태 관리 훅
```

### src/lib/ - 유틸리티 및 설정

**구조**:
```
src/lib/
├── design-tokens.ts        # 디자인 토큰
├── mock-data/              # 목 데이터
│   └── plm.ts
├── trpc-provider.tsx       # tRPC 프로바이더
├── trpc.ts                 # tRPC 클라이언트 설정
└── utils.ts                # 유틸리티 함수 (cn 등)
```

### src/stores/ - 상태 관리

**구조**:
```
src/stores/
├── auth-store.ts           # 인증 상태 (Zustand)
```

## 데이터베이스 스키마

### 테이블 목록

**인증 관련**:
- `users`: 사용자 정보
- `sessions`: 세션 정보
- `roles`: 역할 정보
- `auth_events`: 인증 이력
- `email_verification_tokens`: 이메일 인증 토큰
- `password_reset_tokens`: 비밀번호 재설정 토큰

**이슈 관련**:
- `issues`: 이슈 정보
- `issue_comments`: 이슈 댓글
- `issue_activities`: 이슈 활동 이력

### 키 파일 위치

**진입점**:
- `src/app/layout.tsx`: 루트 레이아웃
- `src/app/page.tsx`: 홈 페이지
- `src/app/api/trpc/[trpc]/route.ts`: tRPC API 핸들러

**설정 파일**:
- `src/server/db/index.ts`: 데이터베이스 클라이언트
- `src/server/trpc/router.ts`: 메인 tRPC 라우터
- `drizzle.config.ts`: Drizzle ORM 설정
- `next.config.ts`: Next.js 설정
- `tailwind.config.ts`: Tailwind CSS 설정
- `tsconfig.json`: TypeScript 설정

## 모듈 간 의존성 관계

### 의존성 방향

```
Frontend Pages (src/app/)
    ↓
React Components (src/components/)
    ↓
tRPC Client (src/lib/trpc.ts)
    ↓
tRPC Server (src/server/trpc/)
    ↓
Domain Modules (src/modules/)
    ↓
Database Layer (src/server/db/)
    ↓
PostgreSQL Database
```

### 상태 관리 흐름

```
User Interaction
    ↓
Component State (useState, useReducer)
    ↓
Global State (Zustand stores/)
    ↓
Server State (TanStack Query + tRPC)
    ↓
Database (Drizzle ORM + PostgreSQL)
```

### 모듈별 의존성

**src/app/**:
- `src/components/` (React 컴포넌트)
- `src/lib/trpc.ts` (tRPC 클라이언트)

**src/components/**:
- `src/ui/` (shadcn/ui 컴포넌트)
- `src/lib/trpc.ts` (데이터 페칭)
- `src/stores/` (전역 상태)

**src/server/trpc/**:
- `src/modules/` (도메인 로직)
- `src/server/db/` (데이터베이스)

**src/modules/**:
- 독립적인 도메인 모듈
- 상호 의존성 최소화

## 파일 명명 규칙

```
컴포넌트:       PascalCase.tsx         (예: UserCard.tsx)
페이지:         page.tsx               (Next.js App Router 규칙)
레�아웃:         layout.tsx             (Next.js App Router 규칙)
API 라우트:     route.ts               (Next.js App Router 규칙)
유틸리티:       camelCase.ts           (예: formatDate.ts)
타�입:          PascalCase.ts          (예: User.ts)
훅:             use-kebab-case.ts      (예: use-auth.ts)
스토어:          kebab-case.ts          (예: auth-store.ts)
상수:           UPPER_SNAKE_CASE.ts    (예: PROJECT_STATUS.ts)
테스트:         *.test.ts              (예: service.test.ts)
E2E 테스트:     *.spec.ts              (예: login.spec.ts)
```

## 빌드 아티팩트

```
.next/                   # Next.js 빌드 결과
├── cache/               # 빌드 캐시
├── server/              # 서버 번들
└── static/              # 정적 리소스
```

## 개발 환경 설정

### 환경변수

`.env.example` 참조:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `TRPC_SERVER_URL`: tRPC 서버 URL
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키

### 패키지 매니저

- **npm**: 프로젝트에서 사용 (package-lock.json)
- **설치**: `npm install`
- **개발 서버**: `npm run dev`
- **빌드**: `npm run build`
- **테스트**: `npm run test`

### 데이터베이스 시작

```bash
# Docker Compose로 PostgreSQL 시작
npm run docker:up

# 데이터베이스 스키마 푸시
npm run db:push

# Drizzle Studio 실행 (DB GUI)
npm run db:studio
```

## 테스트 구조

```
tests/
├── unit/                  # Vitest 단위 테스트
├── integration/           # 통합 테스트
└── e2e/                   # Playwright E2E 테스트
```

**테스트 커버리지 목표**: 85% 이상

## 확장성 고려 사항

### Phase 1: 코어 모듈 (현재)
- Identity, Project, Issue, PLM 모듈 안정화
- 기본 CRUD 기능 구현

### Phase 2: 고급 기능
- Document, Notification, Reporting 모듈 고도화
- 외부 시스템 통합 (GitHub, GitLab, Slack)

### Phase 3: 마이크로서비스 (향후)
- 모듈별 독립 배포 지원
- 이벤트 기반 아키텍처로 전환
- 메시지 큐 도입

## 모노레포 vs 모듈형 모놀리식

현재 구조는 **모듈형 모놀리식**을 따릅니다:

**장점**:
- 단일 데이터베이스로 트랜잭션 관리 용이
- 모듈 간 통신이 함수 호출로 간단
- 배포 및 운영이 단순
- 개발 초기에 빠른 개발 가능

**향후 전환 계획**:
- 규모가 커지면 모듈별 독립 배포 고려
- 마이크로서비스로 분리 시 tRPC 라우터를 API 게이트웨이로 활용
