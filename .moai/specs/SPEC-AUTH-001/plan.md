# SPEC-AUTH-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-AUTH-001 |
| 버전 | 1.0.0 |
| 생성일 | 2026-02-16 |
| 방법론 | Hybrid (TDD for new + DDD for legacy) |

---

## 마일스톤 (Milestones)

### 우선순위 기반 마일스톤

#### Milestone 1: 핵심 인증 인프라 (Primary Goal)

**목표:** 기본적인 사용자 등록, 로그인, 로그아웃 기능 구현

**포함 작업:**
- 데이터베이스 스키마 마이그레이션 (users, sessions, roles, user_roles, auth_events)
- 비밀번호 해시화 유틸리티 구현 (bcrypt-ts)
- JWT 토큰 생성/검증 유틸리티 구현 (jose)
- tRPC 인증 라우터 기본 구조
- 사용자 등록 프로시저 (이메일 인증 토큰 생성)
- 로그인 프로시저 (토큰 발급, 세션 생성)
- 로그아웃 프로시저 (토큰 무효화)

**완료 기준:**
- 사용자가 등록하고 로그인/로그아웃할 수 있음
- JWT 토큰이 정상적으로 발급되고 검증됨
- 세션이 데이터베이스에 저장됨
- 단위 테스트 85% 이상 커버리지

**의존성:** 없음

---

#### Milestone 2: 보안 강화 (Secondary Goal)

**목표:** OWASP 준수 보안 기능 구현

**포함 작업:**
- Rate Limiting 미들웨어 구현
- 계정 잠금 메커니즘 (5회 실패 후 15분 잠금)
- 이메일 인증 플로우 완성 (발송, 검증, 재발송)
- 비밀번호 재설정 플로우 구현
- 보안 쿠키 설정 (httpOnly, Secure, SameSite)
- 보안 감사 로깅 (auth_events 테이블)

**완료 기준:**
- Rate Limiting이 정상 작동 (5회/15분 제한)
- 계정 잠금이 자동으로 해제됨
- 이메일 인증이 완료된 계정만 활성화됨
- 모든 인증 이벤트가 로깅됨
- E2E 테스트 통과

**의존성:** Milestone 1 완료

---

#### Milestone 3: 세션 및 권한 관리 (Secondary Goal)

**목표:** 다중 세션 관리와 RBAC 구현

**포함 작업:**
- 토큰 갱신 프로시저 (리프레시 토큰 로테이션)
- 다중 세션 관리 (최대 5개 기기)
- 세션 목록 조회 및 개별 세션 로그아웃
- roles 및 user_roles 테이블 시드 데이터
- protectedProcedure 미들웨어 구현
- authorized(role[]) 미들웨어 구현
- 역할 기반 라우트 보호

**완료 기준:**
- 토큰 갱신이 자동으로 수행됨
- 6번째 로그인 시 가장 오래된 세션이 종료됨
- 역할에 따라 API 접근이 제어됨
- 권한 변경이 즉시 적용됨
- 통합 테스트 통과

**의존성:** Milestone 1, 2 완료

---

#### Milestone 4: 프론트엔드 통합 (Final Goal)

**목표:** 사용자 인터페이스와 클라이언트 상태 관리

**포함 작업:**
- Zustand 인증 스토어 구현
- ProtectedRoute 컴포넌트 구현
- 로그인/등록/비밀번호 재설정 페이지
- "내 기기" 세션 관리 페이지
- 토큰 자동 갱신 인터셉터
- 권한 기반 UI 컴포넌트 (RoleBasedAccess)

**완료 기준:**
- 사용자가 UI를 통해 모든 인증 작업을 수행할 수 있음
- 인증되지 않은 사용자가 보호된 페이지에 접근할 수 없음
- 토큰이 자동으로 갱신됨
- 역할에 따라 UI 요소가 표시/숨김됨
- Playwright E2E 테스트 통과

**의존성:** Milestone 1, 2, 3 완료

---

#### Milestone 5: 문서화 및 최적화 (Optional Goal)

**목표:** 운영 준비 및 성능 최적화

**포함 작업:**
- API 문서화 (OpenAPI 스펙 생성)
- 인증 플로우 다이어그램 작성
- 성능 메트릭 수집 (Prometheus)
- 부하 테스트 및 병목 지점 최적화
- 보안 감사 체크리스트 검증
- 운영 가이드 작성

**완료 기준:**
- API 문서가 최신 상태로 유지됨
- 성능 목표 달성 (로그인 < 500ms, 갱신 < 200ms)
- 보안 감사 통과
- 운영팀 인수 인계 완료

**의존성:** Milestone 1, 2, 3, 4 완료

---

## 기술적 접근법 (Technical Approach)

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  Pages                    │  Components         │  Store     │
│  - /login                 │  - ProtectedRoute   │  - Auth    │
│  - /register              │  - RoleBasedAccess  │    Store   │
│  - /reset-password        │  - SessionManager   │            │
│  - /sessions              │                     │            │
└─────────────────────────────────────────────────────────────┘
                            │ tRPC Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    tRPC Router Layer                         │
├─────────────────────────────────────────────────────────────┤
│  authRouter                │  userRouter                     │
│  - register                │  - me                           │
│  - login                   │  - updateProfile                │
│  - logout                  │  - changePassword               │
│  - refresh                 │  - sessions                     │
│  - requestPasswordReset    │  - revokeSession                │
│  - resetPassword           │  - revokeAllSessions            │
│  - verifyEmail             │                                 │
└─────────────────────────────────────────────────────────────┘
                            │ Middleware
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware Layer                          │
├─────────────────────────────────────────────────────────────┤
│  - publicProcedure         │  - protectedProcedure           │
│  - isAuthed                │  - authorized(role[])           │
│  - rateLimiter             │  - auditLogger                  │
└─────────────────────────────────────────────────────────────┘
                            │ Services
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  AuthService               │  TokenService                   │
│  - registerUser            │  - generateAccessToken          │
│  - authenticateUser        │  - generateRefreshToken         │
│  - verifyEmail             │  - verifyToken                  │
│  - resetPassword           │  - rotateRefreshToken           │
│                            │                                 │
│  EmailService              │  SessionService                 │
│  - sendVerificationEmail   │  - createSession                │
│  - sendPasswordResetEmail  │  - revokeSession                │
│                            │  - getActiveSessions            │
└─────────────────────────────────────────────────────────────┘
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL                                                 │
│  - users                    │  - user_roles                  │
│  - sessions                 │  - auth_events                 │
│  - roles                    │                                │
└─────────────────────────────────────────────────────────────┘
```

### 기술 스택

**백엔드:**
- Framework: Next.js 15 App Router (API Routes)
- API: tRPC v11
- ORM: Drizzle ORM
- Database: PostgreSQL (Neon serverless)
- JWT: jose (Web Crypto API)
- Password: bcrypt-ts

**프론트엔드:**
- Framework: React 19
- State: Zustand (client), TanStack Query (server)
- Validation: Zod

**테스트:**
- Unit/Integration: Vitest
- E2E: Playwright
- Coverage: 85%+

### 디렉토리 구조

```
src/
├── server/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts          # 확장된 users 스키마
│   │   │   ├── sessions.ts       # 확장된 sessions 스키마
│   │   │   ├── roles.ts          # 신규: roles 테이블
│   │   │   ├── user-roles.ts     # 신규: user_roles 조인 테이블
│   │   │   └── auth-events.ts    # 신규: auth_events 로그
│   │   └── migrations/
│   │       └── 0001_add_auth_tables.sql
│   │
│   ├── services/
│   │   ├── auth-service.ts       # 인증 비즈니스 로직
│   │   ├── token-service.ts      # JWT 토큰 관리
│   │   ├── session-service.ts    # 세션 관리
│   │   └── email-service.ts      # 이메일 발송
│   │
│   ├── trpc/
│   │   ├── routers/
│   │   │   ├── auth.ts           # 인증 라우터
│   │   │   └── user.ts           # 사용자 라우터
│   │   ├── middleware/
│   │   │   ├── is-authed.ts      # 인증 미들웨어
│   │   │   ├── authorized.ts     # 권한 미들웨어
│   │   │   ├── rate-limiter.ts   # Rate Limiting
│   │   │   └── audit-logger.ts   # 감사 로깅
│   │   └── trpc.ts               # tRPC 초기화
│   │
│   └── utils/
│       ├── password.ts           # 비밀번호 해시화
│       ├── jwt.ts                # JWT 유틸리티
│       └── crypto.ts             # 암호화 유틸리티
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # 로그인 페이지
│   │   ├── register/
│   │   │   └── page.tsx          # 등록 페이지
│   │   ├── reset-password/
│   │   │   └── page.tsx          # 비밀번호 재설정
│   │   └── verify-email/
│   │       └── page.tsx          # 이메일 인증
│   │
│   └── (protected)/
│       ├── sessions/
│       │   └── page.tsx          # 세션 관리 페이지
│       └── profile/
│           └── page.tsx          # 프로필 페이지
│
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx    # 라우트 보호 컴포넌트
│   │   ├── RoleBasedAccess.tsx   # 권한 기반 UI
│   │   ├── SessionManager.tsx    # 세션 관리 컴포넌트
│   │   └── LoginForm.tsx         # 로그인 폼
│   │
│   └── ui/
│       └── (shadcn/ui components)
│
├── stores/
│   └── auth-store.ts             # Zustand 인증 스토어
│
├── lib/
│   ├── trpc.ts                   # tRPC 클라이언트
│   └── auth-interceptor.ts       # 토큰 갱신 인터셉터
│
└── __tests__/
    ├── unit/
    │   ├── services/
    │   │   ├── auth-service.test.ts
    │   │   ├── token-service.test.ts
    │   │   └── session-service.test.ts
    │   └── utils/
    │       ├── password.test.ts
    │       └── jwt.test.ts
    │
    ├── integration/
    │   └── trpc/
    │       ├── auth.test.ts
    │       └── user.test.ts
    │
    └── e2e/
        ├── auth-flow.spec.ts     # 전체 인증 플로우
        ├── session-management.spec.ts
        └── rbac.spec.ts
```

---

## 구현 작업 분해 (Task Breakdown)

### Phase 1: 데이터베이스 (Database Layer)

#### Task 1.1: 스키마 확장 및 신규 테이블 생성

**소유자:** expert-backend
**파일:**
- `src/server/db/schema/users.ts` (수정)
- `src/server/db/schema/sessions.ts` (수정)
- `src/server/db/schema/roles.ts` (신규)
- `src/server/db/schema/user-roles.ts` (신규)
- `src/server/db/schema/auth-events.ts` (신규)

**작업 내용:**
1. users 테이블에 컬럼 추가: password_hash, email_verified, email_verified_at, failed_login_attempts, locked_until, status
2. sessions 테이블에 컬럼 추가: user_agent, ip_address, refresh_token_hash, expires_at
3. roles 테이블 생성 (id, name, description, permissions, created_at)
4. user_roles 조인 테이블 생성 (user_id, role_id, assigned_at, assigned_by)
5. auth_events 테이블 생성 (id, user_id, event_type, ip_address, user_agent, metadata, created_at)

**테스트:** 스키마 검증 테스트

---

#### Task 1.2: 마이그레이션 파일 생성

**소유자:** expert-backend
**파일:**
- `drizzle/0001_add_auth_tables.sql` (신규)

**작업 내용:**
1. Drizzle Kit으로 마이그레이션 파일 생성
2. SQL 검증
3. 롤백 스크립트 작성

**테스트:** 마이그레이션 적용/롤백 테스트

---

#### Task 1.3: 시드 데이터 생성

**소유자:** expert-backend
**파일:**
- `drizzle/seed-roles.ts` (신규)

**작업 내용:**
1. 기본 역할 시드 (admin, owner, member, viewer)
2. 기본 권한 매핑

**테스트:** 시드 데이터 검증 테스트

---

### Phase 2: 유틸리티 (Utility Layer)

#### Task 2.1: 비밀번호 해시화 유틸리티

**소유자:** expert-backend
**파일:**
- `src/server/utils/password.ts` (신규)
- `src/__tests__/unit/utils/password.test.ts` (신규)

**작업 내용:**
1. `hashPassword(plainPassword: string): Promise<string>` - bcrypt cost 12
2. `verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>`
3. `validatePasswordStrength(password: string): { valid: boolean; errors: string[] }`

**테스트:**
- 해시화 성공 테스트
- 검증 성공/실패 테스트
- 복잡성 검증 테스트 (8자, 3가지 문자 유형)

---

#### Task 2.2: JWT 토큰 유틸리티

**소유자:** expert-backend
**파일:**
- `src/server/utils/jwt.ts` (신규)
- `src/__tests__/unit/utils/jwt.test.ts` (신규)

**작업 내용:**
1. `generateAccessToken(userId: string, roles: string[]): Promise<string>` - 15분
2. `generateRefreshToken(userId: string): Promise<string>` - 7일
3. `verifyAccessToken(token: string): Promise<JWTPayload>`
4. `verifyRefreshToken(token: string): Promise<JWTPayload>`
5. `decodeToken(token: string): JWTPayload` (검증 없이 디코딩)

**테스트:**
- 토큰 생성 테스트
- 토큰 검증 성공/실패 테스트
- 만료 테스트
- 잘못된 서명 테스트

---

### Phase 3: 서비스 (Service Layer)

#### Task 3.1: TokenService 구현

**소유자:** expert-backend
**파일:**
- `src/server/services/token-service.ts` (신규)
- `src/__tests__/unit/services/token-service.test.ts` (신규)

**작업 내용:**
1. `createTokenPair(userId: string, roles: string[]): Promise<{ accessToken: string; refreshToken: string }>`
2. `rotateRefreshToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>`
3. `revokeRefreshToken(tokenHash: string): Promise<void>`
4. `validateRefreshToken(token: string): Promise<{ userId: string } | null>`

**테스트:**
- 토큰 쌍 생성 테스트
- 리프레시 토큰 로테이션 테스트
- 토큰 무효화 테스트
- 중복 사용 방지 테스트

---

#### Task 3.2: SessionService 구현

**소유자:** expert-backend
**파일:**
- `src/server/services/session-service.ts` (신규)
- `src/__tests__/unit/services/session-service.test.ts` (신규)

**작업 내용:**
1. `createSession(userId: string, userAgent: string, ipAddress: string, refreshTokenHash: string): Promise<Session>`
2. `getActiveSessions(userId: string): Promise<Session[]>`
3. `revokeSession(sessionId: string): Promise<void>`
4. `revokeAllSessions(userId: string): Promise<void>`
5. `enforceSessionLimit(userId: string, maxSessions: number): Promise<void>`

**테스트:**
- 세션 생성 테스트
- 활성 세션 조회 테스트
- 세션 무효화 테스트
- 세션 제한 적용 테스트 (5개 초과 시 가장 오래된 세션 삭제)

---

#### Task 3.3: EmailService 구현

**소유자:** expert-backend
**파일:**
- `src/server/services/email-service.ts` (신규)
- `src/__tests__/unit/services/email-service.test.ts` (신규)

**작업 내용:**
1. `sendVerificationEmail(email: string, verificationToken: string): Promise<void>`
2. `sendPasswordResetEmail(email: string, resetToken: string): Promise<void>`
3. `sendSecurityAlertEmail(email: string, alertType: string): Promise<void>`

**테스트:**
- 이메일 발송 Mock 테스트
- 템플릿 렌더링 테스트

---

#### Task 3.4: AuthService 구현

**소유자:** expert-backend
**파일:**
- `src/server/services/auth-service.ts` (신규)
- `src/__tests__/unit/services/auth-service.test.ts` (신규)

**작업 내용:**
1. `registerUser(email: string, password: string, name: string): Promise<{ user: User; verificationToken: string }>`
2. `authenticateUser(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string } | null>`
3. `verifyEmail(token: string): Promise<boolean>`
4. `requestPasswordReset(email: string): Promise<string>`
5. `resetPassword(token: string, newPassword: string): Promise<boolean>`
6. `incrementFailedAttempts(userId: string): Promise<void>`
7. `checkAccountLock(userId: string): Promise<boolean>`
8. `unlockAccount(userId: string): Promise<void>`

**테스트:**
- 사용자 등록 테스트
- 인증 성공/실패 테스트
- 이메일 인증 테스트
- 비밀번호 재설정 테스트
- 계정 잠금/해제 테스트

---

### Phase 4: 미들웨어 (Middleware Layer)

#### Task 4.1: 인증 미들웨어 (isAuthed)

**소유자:** expert-backend
**파일:**
- `src/server/trpc/middleware/is-authed.ts` (신규)
- `src/__tests__/integration/middleware/is-authed.test.ts` (신규)

**작업 내용:**
1. 쿠키에서 액세스 토큰 추출
2. JWT 검증
3. 사용자 조회 및 컨텍스트 확장
4. 에러 처리 (UNAUTHORIZED)

**테스트:**
- 유효한 토큰 테스트
- 만료된 토큰 테스트
- 토큰 없음 테스트
- 잘못된 토큰 테스트

---

#### Task 4.2: 권한 미들웨어 (authorized)

**소유자:** expert-backend
**파일:**
- `src/server/trpc/middleware/authorized.ts` (신규)
- `src/__tests__/integration/middleware/authorized.test.ts` (신규)

**작업 내용:**
1. 사용자 역할 확인
2. 필요한 역할과 비교
3. 에러 처리 (FORBIDDEN)

**테스트:**
- 권한 있음 테스트
- 권한 없음 테스트
- 다중 역할 테스트

---

#### Task 4.3: Rate Limiting 미들웨어

**소유자:** expert-backend
**파일:**
- `src/server/trpc/middleware/rate-limiter.ts` (신규)
- `src/__tests__/integration/middleware/rate-limiter.test.ts` (신규)

**작업 내용:**
1. IP 기반 요청 카운팅
2. 시간 윈도우 설정 (15분)
3. 제한 초과 시 에러 반환 (TOO_MANY_REQUESTS)
4. Redis 또는 메모리 캐시 사용

**테스트:**
- 제한 내 요청 테스트
- 제한 초과 테스트
- 시간 윈도우 리셋 테스트

---

#### Task 4.4: 감사 로깅 미들웨어

**소유자:** expert-backend
**파일:**
- `src/server/trpc/middleware/audit-logger.ts` (신규)
- `src/__tests__/integration/middleware/audit-logger.test.ts` (신규)

**작업 내용:**
1. 인증 이벤트 감지 (login, logout, token_refresh, password_reset)
2. auth_events 테이블에 로그 저장
3. IP 주소, User-Agent, 메타데이터 기록

**테스트:**
- 이벤트 로깅 테스트
- 메타데이터 기록 테스트

---

### Phase 5: tRPC 라우터 (Router Layer)

#### Task 5.1: authRouter 구현

**소유자:** expert-backend
**파일:**
- `src/server/trpc/routers/auth.ts` (신규)
- `src/__tests__/integration/trpc/auth.test.ts` (신규)

**작업 내용:**
1. `register` 프로시저 (이메일 중복 검사, 비밀번호 해시화, 인증 토큰 생성)
2. `login` 프로시저 (Rate Limiting, 인증, 토큰 발급, 세션 생성)
3. `logout` 프로시저 (토큰 무효화, 세션 삭제)
4. `refresh` 프로시저 (리프레시 토큰 검증, 새 토큰 발급)
5. `verifyEmail` 프로시저 (토큰 검증, 계정 활성화)
6. `requestPasswordReset` 프로시저 (토큰 생성, 이메일 발송)
7. `resetPassword` 프로시저 (토큰 검증, 비밀번호 변경, 세션 무효화)

**테스트:**
- 각 프로시저별 통합 테스트
- 에러 시나리오 테스트
- Rate Limiting 테스트

---

#### Task 5.2: userRouter 구현

**소유자:** expert-backend
**파일:**
- `src/server/trpc/routers/user.ts` (신규)
- `src/__tests__/integration/trpc/user.test.ts` (신규)

**작업 내용:**
1. `me` 프로시저 (현재 사용자 정보)
2. `updateProfile` 프로시저 (이름, 아바타 업데이트)
3. `changePassword` 프로시저 (현재 비밀번호 확인, 새 비밀번호 설정, 세션 무효화)
4. `sessions` 프로시저 (활성 세션 목록)
5. `revokeSession` 프로시저 (특정 세션 로그아웃)
6. `revokeAllSessions` 프로시저 (모든 세션 로그아웃)

**테스트:**
- 각 프로시저별 통합 테스트
- 권한 테스트
- 세션 관리 테스트

---

### Phase 6: 프론트엔드 (Frontend Layer)

#### Task 6.1: Zustand 인증 스토어

**소유자:** expert-frontend
**파일:**
- `src/stores/auth-store.ts` (신규)
- `src/__tests__/unit/stores/auth-store.test.ts` (신규)

**작업 내용:**
1. 사용자 상태 관리 (user, isAuthenticated, isLoading)
2. 로그인/로그아웃 액션
3. 토큰 갱신 액션
4. 인증 상태 확인 액션
5. persist 미들웨어 (localStorage)

**테스트:**
- 상태 변경 테스트
- 액션 테스트
- persist 테스트

---

#### Task 6.2: tRPC 클라이언트 및 인터셉터

**소유자:** expert-frontend
**파일:**
- `src/lib/trpc.ts` (수정)
- `src/lib/auth-interceptor.ts` (신규)

**작업 내용:**
1. tRPC 클라이언트 설정 (쿠키 자동 전송)
2. 401 응답 시 자동 토큰 갱신
3. 갱신 실패 시 로그인 페이지 리다이렉트
4. 요청 재시도 로직

**테스트:**
- 인터셉터 동작 테스트
- 토큰 갱신 테스트
- 리다이렉트 테스트

---

#### Task 6.3: ProtectedRoute 컴포넌트

**소유자:** expert-frontend
**파일:**
- `src/components/auth/ProtectedRoute.tsx` (신규)
- `src/__tests__/unit/components/ProtectedRoute.test.tsx` (신규)

**작업 내용:**
1. 인증 상태 확인
2. 미인증 시 로그인 페이지 리다이렉트
3. 로딩 상태 표시
4. 권한 기반 접근 제어 (requiredRoles prop)

**테스트:**
- 인증된 사용자 렌더링 테스트
- 미인증 사용자 리다이렉트 테스트
- 권한 기반 접근 제어 테스트

---

#### Task 6.4: 로그인/등록 페이지

**소유자:** expert-frontend
**파일:**
- `src/app/(auth)/login/page.tsx` (신규)
- `src/app/(auth)/register/page.tsx` (신규)
- `src/components/auth/LoginForm.tsx` (신규)
- `src/components/auth/RegisterForm.tsx` (신규)

**작업 내용:**
1. 로그인 폼 (이메일, 비밀번호)
2. 등록 폼 (이메일, 비밀번호, 이름, 비밀번호 확인)
3. 폼 유효성 검사 (Zod)
4. 에러 메시지 표시
5. 로딩 상태 표시
6. 비밀번호 재설정 링크

**테스트:**
- 폼 렌더링 테스트
- 유효성 검사 테스트
- 제출 테스트
- 에러 처리 테스트

---

#### Task 6.5: 비밀번호 재설정 페이지

**소유자:** expert-frontend
**파일:**
- `src/app/(auth)/reset-password/page.tsx` (신규)
- `src/app/(auth)/reset-password/[token]/page.tsx` (신규)

**작업 내용:**
1. 이메일 입력 폼 (재설정 요청)
2. 새 비밀번호 입력 폼 (토큰 검증 후)
3. 성공/실패 메시지 표시

**테스트:**
- 재설정 요청 테스트
- 토큰 검증 테스트
- 비밀번호 변경 테스트

---

#### Task 6.6: 세션 관리 페이지

**소유자:** expert-frontend
**파일:**
- `src/app/(protected)/sessions/page.tsx` (신규)
- `src/components/auth/SessionManager.tsx` (신규)

**작업 내용:**
1. 활성 세션 목록 표시 (기기 정보, IP, 마지막 활동)
2. 개별 세션 로그아웃 버튼
3. 모든 기기에서 로그아웃 버튼
4. 현재 세션 하이라이트

**테스트:**
- 세션 목록 렌더링 테스트
- 세션 로그아웃 테스트

---

### Phase 7: E2E 테스트 (End-to-End Testing)

#### Task 7.1: 인증 플로우 E2E 테스트

**소유자:** expert-testing
**파일:**
- `src/__tests__/e2e/auth-flow.spec.ts` (신규)

**작업 내용:**
1. 사용자 등록 플로우 테스트
2. 이메일 인증 플로우 테스트
3. 로그인 플로우 테스트
4. 로그아웃 플로우 테스트
5. 비밀번호 재설정 플로우 테스트

**테스트:** Playwright E2E 테스트

---

#### Task 7.2: 세션 관리 E2E 테스트

**소유자:** expert-testing
**파일:**
- `src/__tests__/e2e/session-management.spec.ts` (신규)

**작업 내용:**
1. 다중 기기 로그인 테스트
2. 세션 목록 조회 테스트
3. 개별 세션 로그아웃 테스트
4. 모든 세션 로그아웃 테스트
5. 최대 세션 제한 테스트 (6번째 로그인 시 가장 오래된 세션 종료)

**테스트:** Playwright E2E 테스트

---

#### Task 7.3: RBAC E2E 테스트

**소유자:** expert-testing
**파일:**
- `src/__tests__/e2e/rbac.spec.ts` (신규)

**작업 내용:**
1. 관리자 권한 테스트 (전체 접근)
2. 멤버 권한 테스트 (제한적 접근)
3. 뷰어 권한 테스트 (읽기 전용)
4. 권한 없음 테스트 (403 Forbidden)
5. 권한 변경 즉시 적용 테스트

**테스트:** Playwright E2E 테스트

---

## 위험 및 완화 전략 (Risks and Mitigation)

### 기술적 위험

| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|----------|
| bcrypt-ts 호환성 문제 | 중간 | 높음 | bcrypt (native) 대안 준비 |
| JWT 토큰 크기 증가 | 낮음 | 중간 | ES256 (짧은 서명) 사용 |
| 이메일 발송 실패 | 중간 | 중간 | 재시도 로직, SMTP 대안 (SendGrid, AWS SES) |
| Rate Limiting 메모리 누수 | 낮음 | 중간 | Redis 사용 또는 정기적 메모리 정리 |

### 일정 위험

| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|----------|
| 스키마 변경으로 인한 지연 | 중간 | 중간 | 충분한 설계 검토, 마이그레이션 테스트 |
| 프론트엔드-백엔드 통합 이슈 | 중간 | 높음 | API 계약 미리 정의, 통합 테스트 병행 |
| E2E 테스트 불안정 | 높음 | 낮음 | 테스트 격리, 재시도 로직 |

### 보안 위험

| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|----------|
| OWASP 미준수 항목 발견 | 낮음 | 높음 | 정기적 보안 리뷰, 침투 테스트 |
| 토큰 탈취 | 낮음 | 높음 | 리프레시 토큰 로테이션, 의심스러운 활동 감지 |
| 무차별 대입 공격 | 높음 | 중간 | Rate Limiting, CAPTCHA (Phase 2) |

---

## 성공 기준 (Success Criteria)

### 기능적 기준

- [ ] 사용자가 등록하고 이메일 인증을 완료할 수 있음
- [ ] 사용자가 로그인하고 로그아웃할 수 있음
- [ ] 토큰이 자동으로 갱신됨
- [ ] 비밀번호를 재설정할 수 있음
- [ ] 다중 기기에서 로그인하고 세션을 관리할 수 있음
- [ ] 역할에 따라 접근이 제어됨

### 품질 기준

- [ ] 단위 테스트 커버리지 85% 이상
- [ ] 통합 테스트 모든 시나리오 통과
- [ ] E2E 테스트 모든 플로우 통과
- [ ] OWASP Top 10 100% 준수
- [ ] TypeScript strict mode 에러 0개
- [ ] ESLint 에러 0개

### 성능 기준

- [ ] 로그인 응답 시간 < 500ms (p95)
- [ ] 토큰 갱신 응답 시간 < 200ms (p95)
- [ ] 동시 로그인 처리 100회/초
- [ ] JWT 검증 시간 < 10ms (p99)

---

## 다음 단계 (Next Steps)

1. **SPEC 승인**: 이해관계자 리뷰 및 승인
2. **구현 시작**: `/moai:2-run SPEC-AUTH-001` 명령으로 manager-ddd 에이전트 실행
3. **진행 상황 추적**: 각 마일스톤 완료 시 문서 업데이트
4. **품질 검증**: manager-quality 에이전트로 TRUST 5 검증
5. **문서화**: 완료 후 `/moai:3-sync SPEC-AUTH-001` 명령으로 문서 동기화

---

## 참고 자료 (References)

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [tRPC Authentication](https://trpc.io/docs/authentication)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
