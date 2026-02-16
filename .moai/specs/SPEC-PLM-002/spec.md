# SPEC-PLM-002: 인증 및 사용자 관리

## Metadata

- ID: SPEC-PLM-002
- Status: Draft
- Priority: P1
- Size: M
- Dependencies: SPEC-PLM-001
- Created: 2026-02-15
- Author: MoAI (drake)

## Overview

Auth.js v5 기반의 인증 시스템을 구현합니다. 이메일/비밀번호 인증, OAuth(GitHub/Google) 지원,
세션 관리, 사용자 프로필, 팀 생성 및 멤버 관리, 역할 기반 접근 제어(RBAC)를 포함합니다.

---

## Requirements (EARS Format)

### Functional Requirements

- FR-001: **WHEN** 사용자가 이메일과 비밀번호로 회원가입 요청을 보내면 **THEN** 시스템은 비밀번호를 bcrypt로 해싱하여 사용자를 생성해야 한다
- FR-002: **WHEN** 사용자가 유효한 이메일과 비밀번호로 로그인하면 **THEN** 시스템은 세션을 생성하고 인증 쿠키를 발급해야 한다
- FR-003: **WHEN** 사용자가 로그아웃 요청을 보내면 **THEN** 시스템은 세션을 삭제하고 인증 쿠키를 무효화해야 한다
- FR-004: **IF** 유효한 세션이 존재하면 **THEN** 시스템은 보호된 페이지/API에 접근을 허용해야 한다
- FR-005: **IF** 유효한 세션이 없으면 **THEN** 시스템은 로그인 페이지로 리다이렉트해야 한다
- FR-006: **WHEN** 인증된 사용자가 프로필 수정 요청을 보내면 **THEN** 시스템은 이름, 아바타 등의 정보를 업데이트해야 한다
- FR-007: **WHEN** 사용자가 팀 생성 요청을 보내면 **THEN** 시스템은 팀을 생성하고 요청자를 owner 역할로 지정해야 한다
- FR-008: **WHEN** 팀 owner가 멤버 초대 요청을 보내면 **THEN** 시스템은 해당 사용자를 팀 멤버로 추가해야 한다
- FR-009: **가능하면** GitHub/Google OAuth 로그인을 제공한다
- FR-010: **WHEN** 비밀번호 재설정 요청이 접수되면 **THEN** 시스템은 재설정 토큰이 포함된 이메일을 발송해야 한다
- FR-011: 시스템은 팀 멤버에 대해 **항상** owner, admin, member 3가지 역할을 구분해야 한다

### Non-Functional Requirements

- NFR-001: 시스템은 **항상** CSRF 보호를 적용해야 한다
- NFR-002: 시스템은 **항상** 인증 엔드포인트에 rate limiting을 적용해야 한다 (분당 10회)
- NFR-003: 시스템은 **항상** httpOnly, secure, sameSite=lax 쿠키 설정을 사용해야 한다
- NFR-004: 비밀번호는 **항상** 8자 이상, 대소문자 + 숫자를 포함해야 한다
- NFR-005: 세션 만료 시간은 **항상** 30일로 설정되어야 한다

---

## User Stories

- US-001: 새 사용자로서, 이메일과 비밀번호로 회원가입할 수 있어야 한다, 그래야 시스템을 사용할 수 있다
- US-002: 기존 사용자로서, 이메일과 비밀번호로 로그인할 수 있어야 한다, 그래야 내 데이터에 접근할 수 있다
- US-003: 인증된 사용자로서, 로그아웃할 수 있어야 한다, 그래야 세션을 안전하게 종료할 수 있다
- US-004: 인증된 사용자로서, 내 프로필을 수정할 수 있어야 한다, 그래야 개인 정보를 관리할 수 있다
- US-005: 인증된 사용자로서, 팀을 생성할 수 있어야 한다, 그래야 다른 사용자들과 협업할 수 있다
- US-006: 팀 owner로서, 멤버를 초대하고 역할을 지정할 수 있어야 한다, 그래야 팀 접근 권한을 관리할 수 있다
- US-007: 사용자로서, 비밀번호를 분실했을 때 재설정할 수 있어야 한다, 그래야 계정 접근성을 회복할 수 있다

---

## Acceptance Criteria

- AC-001: Given 유효한 이메일과 비밀번호를 입력했을 때, When 회원가입을 제출하면, Then 사용자가 생성되고 자동 로그인된다
- AC-002: Given 잘못된 이메일 형식을 입력했을 때, When 회원가입을 제출하면, Then 유효성 검증 에러가 표시된다
- AC-003: Given 이미 등록된 이메일을 입력했을 때, When 회원가입을 제출하면, Then "이미 등록된 이메일입니다" 에러가 표시된다
- AC-004: Given 올바른 자격 증명을 입력했을 때, When 로그인을 제출하면, Then 대시보드로 리다이렉트되고 세션이 생성된다
- AC-005: Given 잘못된 비밀번호를 입력했을 때, When 로그인을 제출하면, Then "인증 정보가 올바르지 않습니다" 에러가 표시된다
- AC-006: Given 로그인 상태일 때, When 로그아웃 버튼을 클릭하면, Then 세션이 삭제되고 로그인 페이지로 이동한다
- AC-007: Given 로그인 상태가 아닐 때, When 보호된 페이지에 접근하면, Then 로그인 페이지로 리다이렉트된다
- AC-008: Given 팀을 생성했을 때, When 팀 목록을 조회하면, Then 생성한 팀이 owner 역할과 함께 표시된다
- AC-009: Given 팀 owner일 때, When 멤버를 초대하면, Then 해당 사용자가 member 역할로 팀에 추가된다
- AC-010: Given 1분 이내에 10회 이상 로그인 시도했을 때, When 추가 로그인을 시도하면, Then rate limiting 에러가 반환된다

---

## Technical Design

### Module: identity

### Database Tables

**users**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK, default gen_random_uuid() |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE, NOT NULL |
| email_verified | timestamp | nullable |
| password_hash | text | nullable (OAuth 사용자) |
| image | text | nullable |
| created_at | timestamp | NOT NULL, default now() |
| updated_at | timestamp | NOT NULL, default now() |

**accounts** (Auth.js OAuth 어댑터)
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id, NOT NULL |
| type | varchar(255) | NOT NULL |
| provider | varchar(255) | NOT NULL |
| provider_account_id | varchar(255) | NOT NULL |
| refresh_token | text | nullable |
| access_token | text | nullable |
| expires_at | integer | nullable |
| token_type | varchar(255) | nullable |
| scope | varchar(255) | nullable |
| id_token | text | nullable |

**sessions**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| session_token | varchar(255) | UNIQUE, NOT NULL |
| user_id | uuid | FK -> users.id, NOT NULL |
| expires | timestamp | NOT NULL |

**teams**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE, NOT NULL |
| description | text | nullable |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

**team_members**
| 컬럼 | 타입 | 제약조건 |
|------|------|---------|
| id | uuid | PK |
| team_id | uuid | FK -> teams.id, NOT NULL |
| user_id | uuid | FK -> users.id, NOT NULL |
| role | enum('owner','admin','member') | NOT NULL, default 'member' |
| joined_at | timestamp | NOT NULL |
| UNIQUE(team_id, user_id) | | |

### tRPC Procedures

```
identity.router
├── auth
│   ├── register          # mutation: 이메일/비밀번호 회원가입
│   ├── getSession         # query: 현재 세션 조회
│   └── resetPassword      # mutation: 비밀번호 재설정 요청
├── user
│   ├── me                 # query: 현재 사용자 정보
│   ├── updateProfile      # mutation: 프로필 수정
│   └── changePassword     # mutation: 비밀번호 변경
└── team
    ├── create             # mutation: 팀 생성
    ├── list               # query: 내 팀 목록
    ├── getById            # query: 팀 상세 조회
    ├── update             # mutation: 팀 정보 수정 (owner/admin)
    ├── addMember          # mutation: 멤버 추가 (owner/admin)
    ├── removeMember       # mutation: 멤버 제거 (owner/admin)
    └── updateMemberRole   # mutation: 멤버 역할 변경 (owner)
```

### Pages

| 경로 | 설명 | 접근 |
|------|------|------|
| `/login` | 로그인 페이지 | Public |
| `/register` | 회원가입 페이지 | Public |
| `/forgot-password` | 비밀번호 찾기 | Public |
| `/settings/profile` | 프로필 설정 | Protected |
| `/settings/teams` | 팀 관리 | Protected |
| `/settings/teams/[id]` | 팀 상세/멤버 관리 | Protected |

### Components

| 컴포넌트 | 설명 |
|---------|------|
| `LoginForm` | 이메일/비밀번호 로그인 폼 |
| `RegisterForm` | 회원가입 폼 |
| `ForgotPasswordForm` | 비밀번호 재설정 폼 |
| `UserMenu` | 헤더 사용자 메뉴 (아바타, 드롭다운) |
| `ProfileForm` | 프로필 수정 폼 |
| `TeamCreateDialog` | 팀 생성 다이얼로그 |
| `TeamMemberList` | 팀 멤버 목록 |
| `InviteMemberDialog` | 멤버 초대 다이얼로그 |
| `AuthGuard` | 인증 필요 페이지 래퍼 |

---

## Edge Cases & Risks

- EC-001: 동시 세션 - 동일 사용자의 여러 기기 세션 허용, 세션별 독립 관리
- EC-002: OAuth 사용자의 비밀번호 재설정 - OAuth 전용 사용자는 비밀번호 미설정, 재설정 시 OAuth 안내
- EC-003: 세션 만료 처리 - 만료된 세션으로 API 호출 시 401 반환, 클라이언트에서 자동 로그아웃
- EC-004: 이메일 인증 흐름 - MVP 단계에서는 이메일 인증 선택사항, 추후 필수화 가능
- EC-005: 팀 owner 탈퇴 - owner 역할 이전 필수, 이전 없이 탈퇴 불가
- RISK-001: Auth.js v5 + Drizzle Adapter 호환성 -> 공식 어댑터 존재 여부 확인 필요 (영향: 높음)
- RISK-002: Rate limiting 구현 방식 -> Next.js middleware 기반 in-memory 또는 Redis 기반 선택 (영향: 중간)
- RISK-003: CSRF 보호 -> Auth.js 내장 CSRF 보호 활용 (영향: 낮음)

---

## Files to Create/Modify

### 신규 생성 파일 (~15개)

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/identity/schemas/users.ts` | users 테이블 Drizzle 스키마 |
| `src/modules/identity/schemas/accounts.ts` | accounts 테이블 Drizzle 스키마 |
| `src/modules/identity/schemas/sessions.ts` | sessions 테이블 Drizzle 스키마 |
| `src/modules/identity/schemas/teams.ts` | teams 테이블 Drizzle 스키마 |
| `src/modules/identity/schemas/team-members.ts` | team_members 테이블 Drizzle 스키마 |
| `src/modules/identity/router.ts` | identity tRPC 라우터 |
| `src/modules/identity/service.ts` | identity 비즈니스 로직 |
| `src/modules/identity/types.ts` | identity 타입 정의 |
| `src/server/auth/index.ts` | Auth.js v5 설정 |
| `src/server/auth/adapter.ts` | Drizzle Auth.js 어댑터 |
| `src/app/(auth)/login/page.tsx` | 로그인 페이지 |
| `src/app/(auth)/register/page.tsx` | 회원가입 페이지 |
| `src/app/(auth)/forgot-password/page.tsx` | 비밀번호 찾기 페이지 |
| `src/app/settings/profile/page.tsx` | 프로필 설정 페이지 |
| `src/app/settings/teams/page.tsx` | 팀 관리 페이지 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `src/server/db/schema.ts` | identity 스키마 import 추가 |
| `src/server/trpc/router.ts` | identity 라우터 등록 |
| `src/server/trpc/context.ts` | 세션 정보 컨텍스트에 추가 |
| `src/app/layout.tsx` | SessionProvider 추가 |

---

## Testing Strategy

### Unit Tests

- 비밀번호 해싱/검증 로직
- 이메일 유효성 검증
- 역할 기반 권한 체크 로직
- Zod 입력 스키마 검증

### Integration Tests

- 회원가입 → 로그인 → 세션 생성 플로우
- 팀 생성 → 멤버 추가 → 역할 변경 플로우
- Rate limiting 동작 검증

### E2E Tests

- 회원가입 → 로그인 → 대시보드 접근 전체 플로우
- 로그아웃 → 보호 페이지 접근 차단 플로우
- 팀 생성 → 멤버 관리 UI 플로우
