# SPEC-AUTH-001: 사용자 인증 시스템

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-AUTH-001 |
| 제목 | 사용자 인증 시스템 |
| 버전 | 1.0.0 |
| 상태 | 계획됨 (Planned) |
| 생성일 | 2026-02-16 |
| 우선순위 | 높음 (High) |
| 담당자 | manager-ddd |
| 수명주기 수준 | spec-anchored (구현 후에도 유지보수) |

## 개요

### 목적

PLM(Product Lifecycle Management) 시스템을 위한 안전하고 확장 가능한 사용자 인증 시스템을 구축합니다. JWT 액세스 토큰과 리프레시 토큰 패턴을 사용하여 서버 사이드 세션을 관리하고, 역할 기반 접근 제어(RBAC)를 통해 권한을 관리합니다.

### 범위

**포함 범위:**
- 사용자 등록 및 이메일 인증
- 로그인/로그아웃 (JWT 기반)
- 비밀번호 재설정
- 토큰 갱신 (Access Token + Refresh Token)
- 역할 기반 접근 제어 (RBAC)
- 다중 세션 관리
- 보안 감사 로깅

**제외 범위:**
- 소셜 로그인 (OAuth2, Google, GitHub 등) - 별도 SPEC로 계획
- 다중 인자 인증 (MFA) - Phase 2 고려사항
- LDAP/Active Directory 통합 - 엔터프라이즈 버전

### 이해관계자

- **일반 사용자**: 계정 생성 및 시스템 접근
- **관리자**: 사용자 관리 및 권한 부여
- **개발팀**: 인증 API 사용 및 통합
- **보안팀**: OWASP 준수 및 취약점 방지

---

## 요구사항 (Requirements)

### EARS 형식 요구사항 명세

#### US-001: 사용자 등록

**설명:** 신규 사용자가 이메일과 비밀번호로 계정을 생성할 수 있습니다.

**요구사항:**

- **WHEN** 사용자가 등록 양식을 제출하면,
- **THE SYSTEM SHALL** 이메일 중복 여부를 확인하고,

- **IF** 이메일이 이미 존재하면,
- **THEN** THE SYSTEM SHALL "이미 등록된 이메일입니다" 오류를 반환한다.

- **IF** 이메일이 중복되지 않으면,
- **THEN** THE SYSTEM SHALL 비밀번호를 bcrypt(cost factor 12)로 해시화하고,

- **THEN** THE SYSTEM SHALL 사용자 계정을 `PENDING` 상태로 생성하고,

- **THEN** THE SYSTEM SHALL 24시간 유효한 이메일 인증 토큰을 생성하여,

- **THEN** THE SYSTEM SHALL 인증 이메일을 발송하고,

- **THEN** THE SYSTEM SHALL 등록 성공 응답을 반환한다.

**승인 조건:**
- GIVEN: 등록되지 않은 이메일과 유효한 비밀번호
- WHEN: 사용자가 등록 요청을 제출
- THEN: 계정이 생성되고 인증 이메일이 발송됨
- AND: 비밀번호는 평문으로 저장되지 않음
- AND: 계정 상태는 PENDING으로 설정됨

---

#### US-002: 이메일 인증

**설명:** 사용자가 이메일 인증 링크를 통해 계정을 활성화합니다.

**요구사항:**

- **WHEN** 사용자가 이메일 인증 링크를 클릭하면,
- **THE SYSTEM SHALL** 토큰 유효성을 검증하고,

- **IF** 토큰이 유효하면,
- **THEN** THE SYSTEM SHALL 계정 상태를 `ACTIVE`로 변경하고,

- **THEN** THE SYSTEM SHALL 인증 토큰을 무효화하고,

- **THEN** THE SYSTEM SHALL "이메일 인증이 완료되었습니다" 메시지를 반환한다.

- **IF** 토큰이 만료되었으면,
- **THEN** THE SYSTEM SHALL "인증 링크가 만료되었습니다" 오류를 반환하고,

- **THEN** THE SYSTEM SHALL 재발송 옵션을 제공한다.

**승인 조건:**
- GIVEN: PENDING 상태의 계정과 유효한 인증 토큰
- WHEN: 사용자가 인증 링크 클릭
- THEN: 계정 상태가 ACTIVE로 변경됨
- AND: 토큰은 재사용 불가능

---

#### US-003: 사용자 로그인

**설명:** 등록된 사용자가 이메일과 비밀번호로 로그인합니다.

**요구사항:**

- **WHEN** 사용자가 로그인 요청을 제출하면,
- **THE SYSTEM SHALL** 이메일로 사용자를 조회하고,

- **IF** 사용자가 존재하고 계정이 `ACTIVE` 상태이면,
- **THEN** THE SYSTEM SHALL 비밀번호를 bcrypt로 검증하고,

- **IF** 비밀번호가 일치하면,
- **THEN** THE SYSTEM SHALL 15분 유효한 액세스 토큰(JWT)을 생성하고,

- **THEN** THE SYSTEM SHALL 7일 유효한 리프레시 토큰을 생성하고,

- **THEN** THE SYSTEM SHALL 리프레시 토큰을 데이터베이스에 저장하고,

- **THEN** THE SYSTEM SHALL httpOnly + Secure + SameSite=strict 쿠키로 토큰을 설정하고,

- **THEN** THE SYSTEM SHALL 로그인 성공 응답을 반환한다. (지연 시간 < 500ms p95)

- **IF** 비밀번호가 일치하지 않으면,
- **THEN** THE SYSTEM SHALL "이메일 또는 비밀번호가 올바르지 않습니다" 오류를 반환하고,

- **THEN** THE SYSTEM SHALL 실패 횟수를 증가시킨다.

- **WHILE** 5분 내 실패 횟수가 5회를 초과하면,
- **THEN** THE SYSTEM SHALL 계정을 15분간 잠그고,

- **THEN** THE SYSTEM SHALL "계정이 잠겼습니다. 15분 후에 다시 시도하세요" 메시지를 반환한다.

**승인 조건:**
- GIVEN: ACTIVE 상태의 계정과 올바른 자격 증명
- WHEN: 로그인 요청
- THEN: 액세스 토큰과 리프레시 토큰 발급
- AND: 응답 시간 < 500ms (95 percentile)
- AND: 5회 실패 시 계정 잠금

---

#### US-004: 비밀번호 재설정

**설명:** 사용자가 이메일을 통해 비밀번호를 재설정합니다.

**요구사항:**

- **WHEN** 사용자가 비밀번호 재설정을 요청하면,
- **THE SYSTEM SHALL** 이메일로 사용자를 조회하고,

- **IF** 사용자가 존재하면,
- **THEN** THE SYSTEM SHALL 1시간 유효한 재설정 토큰을 생성하고,

- **THEN** THE SYSTEM SHALL 재설정 이메일을 발송한다.

- **WHEN** 사용자가 재설정 링크를 클릭하면,
- **THE SYSTEM SHALL** 토큰 유효성을 검증하고,

- **IF** 토큰이 유효하면,
- **THEN** THE SYSTEM SHALL 새 비밀번호를 bcrypt로 해시화하여 저장하고,

- **THEN** THE SYSTEM SHALL 모든 활성 세션을 무효화하고,

- **THEN** THE SYSTEM SHALL 재설정 토큰을 무효화하고,

- **THEN** THE SYSTEM SHALL "비밀번호가 변경되었습니다" 메시지를 반환한다.

**승인 조건:**
- GIVEN: 등록된 이메일
- WHEN: 재설정 요청
- THEN: 재설정 이메일 발송
- AND: 비밀번호 변경 시 모든 세션 무효화

---

#### US-005: 토큰 갱신

**설명:** 만료된 액세스 토큰을 리프레시 토큰으로 갱신합니다.

**요구사항:**

- **WHEN** 액세스 토큰이 만료되면,
- **THE SYSTEM SHALL** 리프레시 토큰의 유효성을 검증하고,

- **IF** 리프레시 토큰이 유효하면,
- **THEN** THE SYSTEM SHALL 새 액세스 토큰(15분)을 생성하고,

- **THEN** THE SYSTEM SHALL 새 리프레시 토큰(7일)을 생성하고,

- **THEN** THE SYSTEM SHALL 기존 리프레시 토큰을 무효화하고,

- **THEN** THE SYSTEM SHALL 새 토큰을 반환한다. (지연 시간 < 200ms p95)

- **IF** 리프레시 토큰이 무효하거나 만료되었으면,
- **THEN** THE SYSTEM SHALL 401 Unauthorized 오류를 반환하고,

- **THEN** THE SYSTEM SHALL 클라이언트에게 재로그인을 요청한다.

**승인 조건:**
- GIVEN: 유효한 리프레시 토큰
- WHEN: 토큰 갱신 요청
- THEN: 새 액세스 토큰과 리프레시 토큰 발급
- AND: 기존 리프레시 토큰 무효화
- AND: 응답 시간 < 200ms (95 percentile)

---

#### US-006: 역할 기반 접근 제어 (RBAC)

**설명:** 사용자의 역할에 따라 시스템 리소스에 대한 접근을 제어합니다.

**요구사항:**

- **THE SYSTEM SHALL** 다음 역할을 지원한다:
  - `admin`: 전체 시스템 관리 권한
  - `owner`: 프로젝트 소유자 권한
  - `member`: 프로젝트 멤버 권한
  - `viewer`: 읽기 전용 권한

- **WHEN** 사용자가 보호된 리소스에 접근하면,
- **THE SYSTEM SHALL** JWT에서 사용자 ID와 역할을 추출하고,

- **THEN** THE SYSTEM SHALL 요청된 작업에 대한 권한을 확인하고,

- **IF** 권한이 있으면,
- **THEN** THE SYSTEM SHALL 요청을 처리한다.

- **IF** 권한이 없으면,
- **THEN** THE SYSTEM SHALL 403 Forbidden 오류를 반환한다.

- **WHEN** 관리자가 사용자의 역할을 변경하면,
- **THEN** THE SYSTEM SHALL 즉시 다음 요청부터 새 권한이 적용된다.

**승인 조건:**
- GIVEN: 특정 역할을 가진 사용자
- WHEN: 권한이 필요한 작업 요청
- THEN: 역할에 따라 접근 허용 또는 거부
- AND: 역할 변경은 즉시 적용

---

#### US-007: 세션 관리

**설명:** 사용자가 여러 기기에서 동시에 로그인할 수 있습니다.

**요구사항:**

- **THE SYSTEM SHALL** 사용자당 최대 5개의 동시 세션을 허용한다.

- **WHEN** 6번째 세션이 생성되면,
- **THEN** THE SYSTEM SHALL 가장 오래된 세션을 자동으로 로그아웃시킨다.

- **WHEN** 사용자가 "내 기기" 페이지를 조회하면,
- **THEN** THE SYSTEM SHALL 모든 활성 세션 목록(기기 정보, IP, 마지막 활동 시간)을 반환한다.

- **WHEN** 사용자가 특정 세션을 로그아웃시키면,
- **THEN** THE SYSTEM SHALL 해당 세션의 리프레시 토큰을 무효화한다.

- **WHEN** 사용자가 "모든 기기에서 로그아웃"을 요청하면,
- **THEN** THE SYSTEM SHALL 해당 사용자의 모든 리프레시 토큰을 무효화한다.

**승인 조건:**
- GIVEN: 로그인된 사용자
- WHEN: 다른 기기에서 로그인
- THEN: 최대 5개 세션 유지
- AND: 초과 시 가장 오래된 세션 종료

---

#### US-008: 보호된 라우트 접근

**설명:** 인증되지 않은 사용자가 보호된 페이지에 접근하는 것을 방지합니다.

**요구사항:**

- **WHEN** 인증되지 않은 사용자가 보호된 라우트에 접근하면,
- **THE SYSTEM SHALL** 401 Unauthorized 상태를 반환하고,

- **THEN** THE SYSTEM SHALL 로그인 페이지로 리다이렉트한다.

- **WHEN** 인증된 사용자가 보호된 라우트에 접근하면,
- **THEN** THE SYSTEM SHALL 요청된 페이지를 정상적으로 렌더링한다.

**승인 조건:**
- GIVEN: 인증되지 않은 사용자
- WHEN: 보호된 라우트 접근
- THEN: 401 상태 및 로그인 페이지로 리다이렉트

---

## 기술적 접근법 (Technical Approach)

### 아키텍처 결정

**선택된 패턴:** JWT 액세스 토큰 + 리프레시 토큰 패턴 (서버 사이드 세션)

**선택 근거:**
1. **확장성**: stateless JWT로 수평 확장 용이
2. **보안성**: 리프레시 토큰을 DB에 저장하여 토큰 탈취 시 무효화 가능
3. **사용자 경험**: 15분 액세스 토큰으로 빈번한 재인증 방지
4. **PLM 요구사항**: 엔터프라이즈 시스템에 적합한 세션 관리

### 데이터베이스 스키마 변경

#### 1. users 테이블 확장

```sql
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'PENDING'; -- PENDING, ACTIVE, LOCKED, DEACTIVATED
```

#### 2. sessions 테이블 확장

```sql
ALTER TABLE sessions ADD COLUMN user_agent TEXT;
ALTER TABLE sessions ADD COLUMN ip_address TEXT;
ALTER TABLE sessions ADD COLUMN refresh_token_hash TEXT;
ALTER TABLE sessions ADD COLUMN expires_at TIMESTAMP;
```

#### 3. roles 테이블 (신규)

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- admin, owner, member, viewer
  description TEXT,
  permissions JSONB, -- ["read:projects", "write:issues", ...]
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. user_roles 테이블 (신규)

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);
```

#### 5. auth_events 테이블 (신규)

```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- login, logout, token_refresh, password_reset, etc.
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API 엔드포인트 (tRPC)

#### Public Procedures (인증 불필요)

```typescript
// src/server/trpc/routers/auth.ts

export const authRouter = createTRPCRouter({
  // 사용자 등록
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100),
      name: z.string().min(2).max(100)
    }))
    .mutation(async ({ input }) => { /* ... */ }),

  // 로그인
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input }) => { /* ... */ }),

  // 로그아웃
  logout: publicProcedure
    .mutation(async ({ ctx }) => { /* ... */ }),

  // 토큰 갱신
  refresh: publicProcedure
    .mutation(async ({ ctx }) => { /* ... */ }),

  // 비밀번호 재설정 요청
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => { /* ... */ }),

  // 비밀번호 재설정 실행
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8).max(100)
    }))
    .mutation(async ({ input }) => { /* ... */ }),

  // 이메일 인증
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => { /* ... */ })
});
```

#### Protected Procedures (인증 필요)

```typescript
// src/server/trpc/routers/user.ts

export const userRouter = createTRPCRouter({
  // 현재 사용자 정보
  me: protectedProcedure
    .query(async ({ ctx }) => { /* ... */ }),

  // 프로필 업데이트
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      avatar: z.string().url().optional()
    }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  // 비밀번호 변경
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).max(100)
    }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  // 활성 세션 목록
  sessions: protectedProcedure
    .query(async ({ ctx }) => { /* ... */ }),

  // 특정 세션 로그아웃
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),

  // 모든 세션 로그아웃
  revokeAllSessions: protectedProcedure
    .mutation(async ({ ctx }) => { /* ... */ })
});
```

### 미들웨어 패턴

#### protectedProcedure 미들웨어

```typescript
// src/server/trpc/trpc.ts

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const accessToken = ctx.req.cookies.get('access_token');

  if (!accessToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '액세스 토큰이 없습니다'
    });
  }

  try {
    const payload = await jwtVerify(accessToken, JWT_SECRET);
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
      with: { roles: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '유효하지 않은 사용자입니다'
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles.map(r => r.name)
        }
      }
    });
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '토큰 검증 실패'
    });
  }
});

export const protectedProcedure = t.procedure.use(isAuthed);
```

#### authorized(role[]) 미들웨어

```typescript
// src/server/trpc/middleware/authorization.ts

export const authorized = (requiredRoles: string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const hasRole = ctx.user.roles.some(role => requiredRoles.includes(role));

    if (!hasRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '접근 권한이 없습니다'
      });
    }

    return next();
  });
};

// 사용 예시
export const adminProcedure = protectedProcedure
  .use(authorized(['admin']));
```

### 보안 구성

#### 비밀번호 보안

- **알고리즘**: bcrypt
- **Cost Factor**: 12 (2026년 기준 권장)
- **최소 길이**: 8자
- **최대 길이**: 100자
- **복잡성 요구사항**: 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함

#### JWT 구성

- **서명 알고리즘**: ES256 (ECDSA) 또는 HS256 (HMAC)
- **액세스 토큰 유효기간**: 15분
- **리프레시 토큰 유효기간**: 7일
- **페이로드**: sub (사용자 ID), iat (발급 시간), exp (만료 시간), roles

#### Rate Limiting

- **로그인 시도**: IP당 5회 / 15분
- **등록 시도**: IP당 3회 / 1시간
- **비밀번호 재설정**: 이메일당 3회 / 1시간

#### 쿠키 보안

```typescript
const cookieOptions = {
  httpOnly: true,    // JavaScript 접근 방지
  secure: true,      // HTTPS만 전송
  sameSite: 'strict' as const, // CSRF 방지
  path: '/',
  domain: process.env.COOKIE_DOMAIN
};

// 액세스 토큰 (15분)
res.cookies.set('access_token', accessToken, {
  ...cookieOptions,
  maxAge: 15 * 60 // 15분
});

// 리프레시 토큰 (7일)
res.cookies.set('refresh_token', refreshToken, {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 // 7일
});
```

### 프론트엔드 통합

#### Zustand 인증 스토어

```typescript
// src/stores/auth-store.ts

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,

        login: async (email, password) => {
          set({ isLoading: true });
          try {
            const result = await trpc.auth.login.mutate({ email, password });
            set({ user: result.user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          await trpc.auth.logout.mutate();
          set({ user: null, isAuthenticated: false });
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const user = await trpc.user.me.query();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        }
      }),
      { name: 'auth-storage' }
    )
  )
);
```

#### ProtectedRoute 컴포넌트

```typescript
// src/components/auth/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (requiredRoles && user) {
      const hasRole = user.roles.some(role => requiredRoles.includes(role));
      if (!hasRole) {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 보안 요구사항 (Security Requirements)

### OWASP Top 10 준수 체크리스트

#### A01: Broken Access Control (접근 제어 실패)

- [ ] 모든 보호된 엔드포인트에서 JWT 검증 수행
- [ ] 역할 기반 권한 검사 구현
- [ ] 사용자 ID는 JWT에서만 추출 (요청 본문에서 수신 금지)
- [ ] 세션 만료 후 자동 로그아웃
- [ ] URL 조작을 통한 무단 접근 방지

#### A02: Cryptographic Failures (암호화 실패)

- [ ] 비밀번호는 bcrypt(cost 12)로 해시화
- [ ] JWT는 ES256 또는 HS256으로 서명
- [ ] HTTPS 강제 사용
- [ ] 민감한 데이터는 로그에 기록하지 않음
- [ ] 리프레시 토큰은 해시화하여 저장

#### A03: Injection (인젝션)

- [ ] Drizzle ORM의 파라미터화된 쿼리 사용
- [ ] 사용자 입력은 Zod로 검증
- [ ] SQL 쿼리에 문자열 연결 금지
- [ ] 이메일 템플릿에서 사용자 입력 이스케이프

#### A04: Insecure Design (안전하지 않은 설계)

- [ ] Rate limiting 구현 (로그인 5회/15분)
- [ ] 계정 잠금 메커니즘 (5회 실패 후 15분 잠금)
- [ ] 토큰 만료 시간 설정 (액세스 15분, 리프레시 7일)
- [ ] 세션당 최대 기기 수 제한 (5개)
- [ ] 보안 질문/답변 저장 금지 (비밀번호 재설정은 토큰 기반)

#### A05: Security Misconfiguration (보안 설정 오류)

- [ ] CORS 설정 (허용된 도메인만)
- [ ] Helmet.js로 보안 헤더 설정
- [ ] 불필요한 HTTP 메서드 비활성화
- [ ] 에러 메시지에 스택 트레이스 노출 금지
- [ ] 기본 계정/비밀번호 사용 금지

#### A06: Vulnerable and Outdated Components (취약한 구성요소)

- [ ] 정기적인 의존성 업데이트 (월 1회)
- [ ] `npm audit` 자동화 (CI/CD)
- [ ] Snyk/Dependabot 사용
- [ ] 사용하지 않는 의존성 제거

#### A07: Identification and Authentication Failures (식별 및 인증 실패)

- [ ] 비밀번호 복잡성 요구사항 (8자 이상, 3가지 이상 문자 유형)
- [ ] 비밀번호 재사용 방지 (최근 5개)
- [ ] 비밀번호 변경 시 모든 세션 무효화
- [ ] 이메일 인증 필수
- [ ] 세션 타임아웃 (15분 비활동 시)

#### A08: Software and Data Integrity Failures (소프트웨어 및 데이터 무결성 실패)

- [ ] JWT 서명 검증 필수
- [ ] 패키지 무결성 검증 (npm ci)
- [ ] CI/CD 파이프라인 보안
- [ ]自動 업데이트 비활성화 (수동 검토 후)

#### A09: Security Logging and Monitoring Failures (보안 로깅 및 모니터링 실패)

- [ ] 모든 인증 이벤트 로깅 (auth_events 테이블)
- [ ] 실패한 로그인 시도 기록
- [ ] 비정상적인 활동 감지 (짧은 시간 다수 시도)
- [ ] 로그는 구조화된 JSON 형식
- [ ] 로그는 최소 90일 보관

#### A10: Server-Side Request Forgery (SSRF)

- [ ] 외부 URL 요청 시 화이트리스트 사용
- [ ] 사용자 입력으로 URL 생성 금지
- [ ] 이메일 템플릿은 로컬 저장
- [ ] 외부 API 호출 시 도메인 검증

---

## 엣지 케이스 (Edge Cases)

### 토큰 관리

1. **요청 중 토큰 만료**
   - 시나리오: 사용자가 API 요청 중 액세스 토큰이 만료됨
   - 처리: 클라이언트에서 자동으로 리프레시 토큰으로 갱신 후 요청 재시도

2. **토큰 탈취 의심**
   - 시나리오: 리프레시 토큰이 이미 사용된 것을 감지
   - 처리: 해당 사용자의 모든 세션 무효화, 이메일 알림, 보안 로그 기록

3. **비밀번호 변경 중 요청**
   - 시나리오: 사용자가 비밀번호를 변경하는 동안 다른 요청 수신
   - 처리: 비밀번호 변경 완료 시 모든 토큰 무효화, 재로그인 요구

### 인증

4. **동시 다중 로그인 요청**
   - 시나리오: 동일 계정으로 여러 기기에서 동시에 로그인 시도
   - 처리: 모든 요청 처리, 세션 수 제한(5개) 적용

5. **계정 잠금 우회 시도**
   - 시나리오: 계정이 잠긴 상태에서 다른 IP로 로그인 시도
   - 처리: IP 무관하게 잠금 유지, 로그인 시도 기록

6. **이메일 변경 중 인증**
   - 시나리오: 이메일 변경 요청 후 새 이메일 인증 완료 전 로그인
   - 처리: 기존 이메일로 로그인 가능, 새 이메일 인증 후에만 변경 적용

### 비밀번호

7. **비밀번호 재사용**
   - 시나리오: 사용자가 최근 사용한 비밀번호로 변경 시도
   - 처리: 최근 5개 비밀번호와 비교, 거부 메시지 반환

8. **비밀번호 복잡성 검증 실패**
   - 시나리오: 사용자가 복잡성 요구사항을 충족하지 않는 비밀번호 입력
   - 처리: 구체적인 실패 사유 반환 (예: "특수문자가 포함되어야 합니다")

9. **비밀번호 변경 중 세션 만료**
   - 시나리오: 비밀번호 변경 폼 작성 중 세션이 만료됨
   - 처리: 변경 요청 시 401 반환, 로그인 페이지로 리다이렉트

### 세션

10. **고아 세션 정리**
    - 시나리오: 사용자가 브라우저를 닫아 세션이 남아있음
    - 처리: 만료된 세션은 7일 후 자동 삭제

11. **동시 토큰 갱신 요청**
    - 시나리오: 여러 탭에서 동시에 토큰 갱신 요청
    - 처리: 첫 번째 요청만 성공, 나머지는 401 반환 (리프레시 토큰 재사용 방지)

12. **세션 무효화 전파 지연**
    - 시나리오: 관리자가 사용자 세션을 무효화했지만 즉시 적용되지 않음
    - 처리: 액세스 토큰은 15분 내 자연 만료, 긴급 시 사용자 상태를 LOCKED로 변경

### 네트워크

13. **이중 폼 제출**
    - 시나리오: 사용자가 로그인 버튼을 빠르게 여러 번 클릭
    - 처리: 첫 번째 요청만 처리, 나머지는 무시 (중복 요청 방지 토큰 사용)

14. **이메일 발송 실패**
    - 시나리오: 인증 이메일 발송 중 SMTP 오류 발생
    - 처리: 사용자에게 "이메일 발송 실패, 재발송 요청 가능" 메시지, 재발송 옵션 제공

15. **토큰 갱신 중 네트워크 오류**
    - 시나리오: 토큰 갱신 요청 중 네트워크 연결 끊김
    - 처리: 클라이언트에서 재시도 로직 구현, 최대 3회 시도

### 데이터 무결성

16. **동시 프로필 업데이트**
    - 시나리오: 사용자가 두 기기에서 동시에 프로필 업데이트
    - 처리: 마지막 업데이트 승리, 충돌 감지 시 사용자에게 알림

17. **역할 변경 전파**
    - 시나리오: 관리자가 사용자 역할을 변경했지만 사용자는 모름
    - 처리: 다음 API 요청 시 새 역할 적용, UI에서 알림 표시

18. **이메일 인증 토큰 재사용**
    - 시나리오: 사용자가 인증 링크를 두 번 클릭
    - 처리: 첫 번째 클릭만 유효, 두 번째는 "이미 인증된 계정입니다" 메시지

### 계정 상태

19. **비활성화된 계정 로그인 시도**
    - 시나리오: 관리자에 의해 비활성화된 계정으로 로그인 시도
    - 처리: "계정이 비활성화되었습니다. 관리자에게 문의하세요" 메시지

20. **삭제된 계정으로 로그인 시도**
    - 시나리오: 삭제된 계정(soft delete)으로 로그인 시도
    - 처리: "계정을 찾을 수 없습니다" 메시지 (보안상 삭제 여부 노출 금지)

21. **만료된 이메일 인증 토큰**
    - 시나리오: 24시간이 지난 이메일 인증 링크 클릭
    - 처리: "인증 링크가 만료되었습니다" 메시지, 재발송 옵션 제공

### 경계 조건

22. **최대 세션 수 도달**
    - 시나리오: 5개 기기에서 이미 로그인, 6번째 기기에서 로그인 시도
    - 처리: 가장 오래된 세션 자동 로그아웃, 새 세션 생성

23. **비밀번호 최대 길이 초과**
    - 시나리오: 사용자가 100자를 초과하는 비밀번호 입력
    - 처리: "비밀번호는 100자를 초과할 수 없습니다" 오류 반환

---

## 비기능 요구사항 (Non-Functional Requirements)

### 성능

| 메트릭 | 목표 | 측정 방법 |
|--------|------|-----------|
| 로그인 응답 시간 | < 500ms (p95) | Prometheus 메트릭 |
| 토큰 갱신 응답 시간 | < 200ms (p95) | Prometheus 메트릭 |
| 동시 로그인 처리 | 100회/초 | 부하 테스트 |
| JWT 검증 시간 | < 10ms (p99) | 내부 계측 |
| 비밀번호 해시화 | < 200ms (bcrypt cost 12) | 내부 계측 |

### 신뢰성

- **가용성**: 99.9% (월 43분 다운타임 허용)
- **데이터 일관성**: ACID 트랜잭션으로 보장
- **장애 복구**: 자동 장애 조치 < 30초
- **백업**: 일일 자동 백업, 30일 보관

### 확장성

- **수평 확장**: Stateless JWT로 다중 인스턴스 지원
- **세션 저장소**: PostgreSQL (향후 Redis로 이동 고려)
- **토큰 블랙리스트**: 메모리 캐시 + DB 하이브리드

### 보안

- **OWASP 준수**: Top 10 100% 준수
- **정기 감사**: 분기별 보안 감사
- **침투 테스트**: 연 2회 수행
- **취약점 스캔**: 주 1회 자동화

### 호환성

- **브라우저**: Chrome, Firefox, Safari, Edge (최신 2버전)
- **모바일**: iOS 14+, Android 10+
- **API 버전**: tRPC v11 호환

---

## 추적성 (Traceability)

### 관련 문서

- `.moai/project/product.md` - 비즈니스 요구사항
- `.moai/project/tech.md` - 기술 스택 (Next.js 15, tRPC, PostgreSQL)
- `.moai/project/structure.md` - 프로젝트 구조

### 의존성

- **선행 SPEC**: 없음
- **후행 SPEC**:
  - SPEC-OAUTH-001: 소셜 로그인 (계획됨)
  - SPEC-MFA-001: 다중 인자 인증 (계획됨)
  - SPEC-AUTHZ-001: 세밀한 권한 관리 (계획됨)

### 외부 의존성

**추가 필요한 패키지:**

```json
{
  "dependencies": {
    "jose": "^6.0.0",           // JWT 구현 (Web Crypto API 기반)
    "bcrypt-ts": "^5.0.0"       // 비밀번호 해시화 (TypeScript 네이티브)
  }
}
```

**기존 의존성 활용:**

- `@trpc/server` - tRPC 서버
- `@trpc/client` - tRPC 클라이언트
- `drizzle-orm` - ORM
- `zod` - 스키마 검증
- `zustand` - 클라이언트 상태 관리
- `@tanstack/react-query` - 서버 상태 관리

---

## 변경 이력 (Change History)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-02-16 | manager-spec | 초기 SPEC 생성 |

---

## 승인 (Approval)

| 역할 | 이름 | 승인일 | 서명 |
|------|------|--------|------|
| 프로젝트 관리자 | | | |
| 기술 리드 | | | |
| 보안 담당자 | | | |

---

**참고**: 이 SPEC은 EARS(시스템은 **항상**, **WHEN** [조건], **THE SYSTEM SHALL** [동작]) 형식을 따르며, TRUST 5 프레임워크(Tested, Readable, Unified, Secured, Trackable)를 준수합니다.
