# Project Memory - PLM System Web (team-tester)

## Project Overview
- **Project**: PLM System Web
- **Framework**: Next.js 15 with TypeScript
- **Location**: D:\workspace-github\plm-system-web
- **Owner**: drake
- **Current Team**: moai-run-auth-001

---

## Current SPEC: SPEC-AUTH-001 - User Authentication System

### Status: Implementation in Progress

### My Role: team-tester
- **Task**: Task 8 - Write comprehensive tests for auth system
- **Dependencies**: Must wait for Tasks 3, 4, 5 (backend) and Task 7 (frontend) to complete
- **Status**: WAITING for implementation

---

## Test Framework Configuration

### Vitest Setup
- **Config**: `D:\workspace-github\plm-system-web\vitest.config.ts`
- **Environment**: jsdom
- **Setup File**: `D:\workspace-github\plm-system-web\tests\unit\setup.ts`
- **Test Pattern**: `**/*.test.{ts,tsx}`

### Coverage Targets
- Overall: 85%+
- New code: 90%+
- Critical paths: 100%

### Test Directories
- Unit tests: `tests/unit/` (co-located with source or in tests/ directory)
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/` (using Playwright)

---

## Test File Ownership (Exclusive)

As team-tester, I exclusively own:
- `tests/auth/*` - Auth utility tests
- `tests/trpc/*` - tRPC router tests
- `tests/integration/*` - Integration tests
- `tests/e2e/*` - E2E tests

---

## Planned Tests (for SPEC-AUTH-001)

### 1. Unit Tests

#### JWT Utility Tests (`tests/auth/jwt.test.ts`)
```typescript
describe('JWT Utilities', () => {
  // Token generation
  it('should generate access token with correct payload')
  it('should generate refresh token with correct expiration')

  // Token verification
  it('should verify valid token')
  it('should reject invalid token')
  it('should reject expired token')

  // Token rotation
  it('should rotate refresh token correctly')

  // Edge cases
  it('should handle empty secret')
  it('should handle malformed token')
})
```

#### Password Tests (`tests/auth/password.test.ts`)
```typescript
describe('Password Utilities', () => {
  // Hashing
  it('should hash password with bcrypt')
  it('should use cost factor 12')

  // Verification
  it('should verify correct password')
  it('should reject wrong password')

  // Complexity validation
  it('should validate password complexity (8+ chars, 3 types)')
  it('should reject weak passwords')

  // Edge cases
  it('should handle empty password')
  it('should handle too long password (>100 chars)')
})
```

#### tRPC Auth Router Tests (`tests/trpc/auth.test.ts`)
```typescript
describe('Auth Router', () => {
  describe('register', () => {
    it('should register new user')
    it('should reject duplicate email')
    it('should reject invalid email')
    it('should reject weak password')
  })

  describe('login', () => {
    it('should login with valid credentials')
    it('should reject wrong password')
    it('should reject non-existent user')
    it('should enforce rate limit')
    it('should lock account after 5 failed attempts')
  })

  describe('logout', () => {
    it('should logout authenticated user')
    it('should handle not logged in state')
  })

  describe('refresh', () => {
    it('should refresh with valid token')
    it('should reject invalid token')
    it('should reject expired token')
  })

  describe('verifyEmail', () => {
    it('should verify with valid token')
    it('should reject invalid token')
    it('should reject expired token')
  })

  describe('requestPasswordReset', () => {
    it('should send reset email')
    it('should handle non-existent email gracefully')
  })

  describe('resetPassword', () => {
    it('should reset password with valid token')
    it('should reject invalid token')
  })
})
```

#### tRPC User Router Tests (`tests/trpc/user.test.ts`)
```typescript
describe('User Router', () => {
  describe('me', () => {
    it('should return current user')
    it('should require authentication')
  })

  describe('updateProfile', () => {
    it('should update profile')
    it('should require authentication')
  })

  describe('changePassword', () => {
    it('should change password with correct current password')
    it('should reject wrong current password')
    it('should require authentication')
  })

  describe('sessions', () => {
    it('should list active sessions')
    it('should require authentication')
  })

  describe('revokeSession', () => {
    it('should revoke specific session')
    it('should require authentication')
    it('should reject invalid session ID')
  })

  describe('revokeAllSessions', () => {
    it('should revoke all sessions')
    it('should require authentication')
  })
})
```

#### Middleware Tests (`tests/trpc/middleware.test.ts`)
```typescript
describe('Auth Middleware', () => {
  describe('protectedProcedure', () => {
    it('should allow authenticated user')
    it('should reject unauthenticated user')
    it('should reject invalid token')
  })

  describe('authorized', () => {
    it('should allow authorized user')
    it('should reject unauthorized user')
    it('should require authentication')
  })
})
```

### 2. Integration Tests

#### Full Auth Flow (`tests/integration/auth-flow.test.ts`)
```typescript
describe('Auth Flow Integration', () => {
  it('should complete registration -> verification -> login -> logout')
  it('should handle token refresh during API call')
  it('should complete password reset flow')
  it('should manage multiple sessions')
  it('should lock account after failed attempts')
})
```

### 3. E2E Tests (Playwright)

#### Auth Flow E2E (`tests/e2e/auth-flow.spec.ts`)
```typescript
test.describe('Authentication Flow', () => {
  test('should register new user')
  test('should verify email')
  test('should login')
  test('should logout')
  test('should reset password')
})
```

---

## Testing Best Practices

### Mock Strategy
- **External Services**: Mock email sending (nodemailer, SendGrid)
- **Database**: Use test fixtures, clean up after each test
- **JWT Secret**: Mock with test secret for consistent results
- **bcrypt**: Can mock for faster tests (use vi.mock)

### Test Structure
- Use `describe` blocks for grouping
- Use descriptive test names: "should return 401 when not authenticated"
- Test error cases, not just happy paths
- Use `beforeEach` and `afterEach` for setup/teardown

### Coverage Requirements
- 85%+ overall coverage
- 90%+ coverage for new code
- All critical paths covered
- Edge cases tested

---

## Implementation Status Check

### Backend Files (Waiting for)
- [ ] `src/server/utils/jwt.ts`
- [ ] `src/server/utils/password.ts`
- [ ] `src/server/services/token-service.ts`
- [ ] `src/server/services/session-service.ts`
- [ ] `src/server/services/auth-service.ts`
- [ ] `src/server/trpc/routers/auth.ts`
- [ ] `src/server/trpc/routers/user.ts`
- [ ] `src/server/trpc/middleware/is-authed.ts`
- [ ] `src/server/trpc/middleware/authorized.ts`

### Frontend Files (Waiting for)
- [ ] `src/stores/auth-store.ts`
- [ ] `src/components/auth/ProtectedRoute.tsx`
- [ ] `src/components/auth/LoginForm.tsx`
- [ ] `src/components/auth/RegisterForm.tsx`
- [ ] `src/components/auth/SessionManager.tsx`

---

## Communication Protocol

### Reporting Failures
- Backend test failures -> Report to backend-dev
- Frontend test failures -> Report to frontend-dev
- Integration issues -> Report to team-lead

### Task Coordination
1. Wait for Tasks 3, 4, 5 (backend) to complete
2. Wait for Task 7 (frontend) to complete
3. Claim Task 8 via TaskUpdate
4. Write tests systematically
5. Run tests: `npm run test`
6. Report failures to responsible teammates
7. Mark task completed when coverage targets met

---

## Quick Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test tests/auth/jwt.test.ts

# Run E2E tests
npm run test:e2e
```

---

## Session Notes

### 2026-02-16 - Initial Assessment
**Status**: Waiting for implementation

**Observations**:
- Backend implementation files don't exist yet
- Frontend auth store and components don't exist yet
- Test framework (Vitest) is properly configured
- Sample tRPC test exists as reference

**Next Steps**:
1. Wait for backend-dev to complete service layer implementation
2. Wait for frontend-dev to complete auth components
3. Begin writing tests once implementation is complete

**Dependencies**:
- Task 3 (backend-dev): Service layer
- Task 4 (backend-dev): Middleware and routers
- Task 5 (backend-dev): Database schema
- Task 7 (frontend-dev): Auth store and components
