# SPEC-PLM-AUTH: User Authentication and Authorization System

## Metadata

- ID: SPEC-PLM-AUTH
- Status: Draft
- Priority: P0 (Critical Foundation)
- Size: L (Large - multi-phase implementation)
- Dependencies: None (Foundation feature)
- Created: 2026-02-16
- Author: MoAI Team (researcher + analyst + architect)
- Related: Updates SPEC-PLM-002

## Overview

Implement a complete authentication and authorization system for the PLM System Web application. The current codebase has placeholder stubs but no functional authentication. This SPEC provides a practical implementation approach based on codebase analysis, resolving database inconsistencies and providing a phased rollout strategy.

### Current State Assessment

**Existing Codebase:**
- Placeholder files in `src/modules/identity/` (auth.ts, user.ts, role.ts, permission.ts)
- UI scaffolds in `src/app/(auth)/login/page.tsx` and `register/page.tsx`
- Empty `protectedProcedure` in tRPC procedures
- Database schemas defined but inconsistent with actual database configuration

**Critical Issues Identified:**
1. Database mismatch: Schemas use `pgTable` (PostgreSQL) but db/index.ts uses `better-sqlite3`
2. No password hashing library installed
3. No session token generation/validation logic
4. tRPC context does not include user/session information
5. No authentication middleware for protected routes

---

## Requirements (EARS Format)

### Functional Requirements - Phase 1 (MVP)

- FR-001: **WHEN** a new user submits registration with valid email and password, **THEN** the system SHALL hash the password using bcrypt and create a user record
- FR-002: **WHEN** a user submits login with valid credentials, **THEN** the system SHALL generate a session token, store it, and return user data with authentication token
- FR-003: **WHEN** an authenticated user makes a request with a valid session token, **THEN** the system SHALL identify the user and provide access to protected resources
- FR-004: **WHEN** a user logs out, **THEN** the system SHALL invalidate the session token
- FR-005: **IF** a request lacks valid authentication, **THEN** the system SHALL return 401 Unauthorized for API calls
- FR-006: **IF** an unauthenticated user accesses a protected page, **THEN** the system SHALL redirect to the login page

### Functional Requirements - Phase 2 (Enhanced)

- FR-007: **WHEN** a user requests password reset, **THEN** the system SHALL generate a reset token and send it via email (Phase 2 - email service integration)
- FR-008: **WHEN** a user updates their profile, **THEN** the system SHALL persist the changes and update the session context
- FR-009: **WHEN** a user creates a team, **THEN** the system SHALL create the team and assign the user as owner
- FR-010: **WHEN** a team owner adds a member, **THEN** the system SHALL add the user to the team with the specified role

### Functional Requirements - Phase 3 (OAuth - Optional)

- FR-011: **WHERE POSSIBLE** the system SHALL provide GitHub OAuth login
- FR-012: **WHERE POSSIBLE** the system SHALL provide Google OAuth login

### Non-Functional Requirements

- NFR-001: The system **SHALL** use bcrypt (cost factor 12) for password hashing
- NFR-002: The system **SHALL** use cryptographically secure random tokens for sessions
- NFR-003: The system **SHALL** set session cookies with httpOnly, secure, and sameSite=lax attributes
- NFR-004: The system **SHALL** enforce rate limiting on authentication endpoints (10 requests per minute per IP)
- NFR-005: The system **SHALL** expire sessions after 30 days of inactivity
- NFR-006: The system **SHALL** log all authentication events (login, logout, failed attempts)
- NFR-007: Passwords **MUST** be at least 8 characters with uppercase, lowercase, and number
- NFR-008: The system **SHALL** sanitize all user inputs to prevent injection attacks

---

## User Stories

- US-001: As a new user, I want to register with email/password so I can access the PLM system
- US-002: As a returning user, I want to login so I can access my projects and data
- US-003: As an authenticated user, I want to logout so I can securely end my session
- US-004: As a user, I want to reset my password if I forget it so I can regain access
- US-005: As a user, I want to update my profile information so my team can identify me
- US-006: As a user, I want to create a team so I can collaborate with others
- US-007: As a team owner, I want to invite members and assign roles so I can manage team access

---

## Acceptance Criteria

### Phase 1 - Core Authentication

- AC-001: Given valid email and password, When registration is submitted, Then user is created and auto-logged in
- AC-002: Given invalid email format, When registration is submitted, Then validation error is displayed
- AC-003: Given duplicate email, When registration is submitted, Then "Email already registered" error is shown
- AC-004: Given correct credentials, When login is submitted, Then user is redirected to dashboard with valid session
- AC-005: Given incorrect password, When login is submitted, Then "Invalid credentials" error is shown
- AC-006: Given authenticated session, When protected API is called, Then request succeeds with user context
- AC-007: Given no session, When protected API is called, Then 401 Unauthorized is returned
- AC-008: Given authenticated state, When logout is clicked, Then session is cleared and redirected to login

### Phase 2 - Team Management

- AC-009: Given authenticated user, When team is created, Then team appears in user's team list with owner role
- AC-010: Given team owner, When member is invited, Then member can access team resources
- AC-011: Given non-owner, When attempting to add members, Then "Insufficient permissions" error is returned

### Phase 3 - Security

- AC-012: Given 10 failed login attempts within 1 minute, When 11th attempt is made, Then rate limit error is returned
- AC-013: Given expired session, When protected resource is accessed, Then 401 is returned and client auto-logout

---

## Technical Design

### Architecture Decision: Custom Implementation vs Auth.js

**Decision: Custom Lightweight Implementation (Phase 1), Consider Auth.js for Phase 3**

**Rationale:**
1. Current codebase uses tRPC (not typical Auth.js integration pattern)
2. Database configuration uses SQLite (mismatch with Auth.js PostgreSQL assumption)
3. Custom implementation gives full control over session management
4. Faster to implement for MVP without heavy dependencies
5. Can migrate to Auth.js later if OAuth becomes critical

### Database Resolution

**Decision: Migrate to PostgreSQL before authentication implementation**

**Rationale:**
1. Existing schemas already use `pgTable`
2. PostgreSQL is production-grade for enterprise PLM system
3. Better for concurrent sessions and transactions
4. Consistent with SPEC-PLM-002 vision

### Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT,
  email_verified TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Drizzle Schema Implementation

File: `src/server/db/schema-users.ts`
```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash'),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
})

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

### tRPC Router Structure

File: `src/server/trpc/routers/identity.ts`
```typescript
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { protectedProcedure, publicProcedure, router } from '../index'
import * as schema from '../../db/schema-users'
import { hashPassword, verifyPassword, generateToken, verifyToken } from './lib/auth'

export const identityRouter = router({
  // Auth procedures
  auth: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
        name: z.string().min(1).max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user exists
        const existing = await ctx.db.select()
          .from(schema.users)
          .where(eq(schema.users.email, input.email))
          .limit(1)

        if (existing.length > 0) {
          throw new Error('Email already registered')
        }

        // Create user
        const passwordHash = await hashPassword(input.password)
        const result = await ctx.db.insert(schema.users).values({
          email: input.email,
          name: input.name,
          passwordHash,
        }).returning()

        const user = result[0]

        // Create session
        const token = generateToken()
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        await ctx.db.insert(schema.sessions).values({
          userId: user.id,
          token,
          expiresAt,
        })

        return { user, token }
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await ctx.db.select()
          .from(schema.users)
          .where(eq(schema.users.email, input.email))
          .limit(1)

        const user = result[0]
        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        const valid = await verifyPassword(input.password, user.passwordHash)
        if (!valid) {
          throw new Error('Invalid credentials')
        }

        // Create session
        const token = generateToken()
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        await ctx.db.insert(schema.sessions).values({
          userId: user.id,
          token,
          expiresAt,
        })

        return { user: { id: user.id, email: user.email, name: user.name }, token }
      }),

    logout: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.session) {
          throw new Error('Not authenticated')
        }
        await ctx.db.delete(schema.sessions)
          .where(eq(schema.sessions.token, ctx.session.token))
        return { success: true }
      }),

    getSession: publicProcedure
      .query(async ({ ctx }) => {
        // Extract token from headers
        const token = ctx.req.headers.get('authorization')?.replace('Bearer ', '')
        if (!token) return null

        const result = await ctx.db.select({
          session: schema.sessions,
          user: {
            id: schema.users.id,
            email: schema.users.email,
            name: schema.users.name,
            image: schema.users.image,
          },
        })
          .from(schema.sessions)
          .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
          .where(and(
            eq(schema.sessions.token, token),
            // Add expiration check
          ))
          .limit(1)

        if (result.length === 0) return null

        return result[0]
      }),
  }),

  // User procedures
  user: router({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.user
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255).optional(),
        image: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db.update(schema.users)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(schema.users.id, ctx.user.id))

        return { success: true }
      }),
  }),

  // Team procedures
  team: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await ctx.db.insert(schema.teams).values(input).returning()
        const team = result[0]

        // Add creator as owner
        await ctx.db.insert(schema.teamMembers).values({
          teamId: team.id,
          userId: ctx.user.id,
          role: 'owner',
        })

        return team
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const result = await ctx.db.select({
          team: schema.teams,
          role: schema.teamMembers.role,
        })
          .from(schema.teamMembers)
          .innerJoin(schema.teams, eq(schema.teamMembers.teamId, schema.teams.id))
          .where(eq(schema.teamMembers.userId, ctx.user.id))

        return result
      }),
  }),
})
```

### Context Enhancement

File: `src/server/trpc/context.ts`
```typescript
import { type NextRequest } from 'next/server'
import { db } from '../db'
import * as schema from '../db/schema-users'
import { eq, and, gt } from 'drizzle-orm'

export interface SessionUser {
  id: string
  email: string
  name: string
  image: string | null
}

export interface Context {
  req: NextRequest
  db: typeof db
  user: SessionUser | null
  session: { token: string; userId: string } | null
}

export async function createContext({ req }: { req: NextRequest }): Promise<Context> {
  // Extract token from Authorization header or cookie
  const authHeader = req.headers.get('authorization')
  const cookieHeader = req.cookies.get('session')?.value
  const token = authHeader?.replace('Bearer ', '') || cookieHeader

  let user: Context['user'] = null
  let session: Context['session'] = null

  if (token) {
    const result = await db.select({
      user: {
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        image: schema.users.image,
      },
      session: {
        token: schema.sessions.token,
        userId: schema.sessions.userId,
      },
    })
      .from(schema.sessions)
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(and(
        eq(schema.sessions.token, token),
        gt(schema.sessions.expiresAt, new Date())
      ))
      .limit(1)

    if (result.length > 0) {
      user = result[0].user
      session = result[0].session
    }
  }

  return {
    req,
    db,
    user,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

### Protected Procedure

File: `src/server/trpc/procedures.ts`
```typescript
import { z } from 'zod'
import { publicProcedure, router } from './index'
import type { Context } from './context'

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new Error('Unauthorized - Please login to continue')
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  })
})
```

### Utility Functions

File: `src/server/trpc/lib/auth.ts`
```typescript
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyToken(token: string): boolean {
  // Basic validation - can be enhanced
  return /^[a-f0-9]{64}$/.test(token)
}
```

---

## Edge Cases & Risks

### Edge Cases

- EC-001: Concurrent sessions from multiple devices - Allow multiple sessions, invalidate individually
- EC-002: Session expiration mid-request - Check expiry on each request, return 401 if expired
- EC-003: Password reset for OAuth-only users - Show message to use OAuth login
- EC-004: Team owner deletion - Require role transfer before allowing owner removal
- EC-005: Email change during active session - Update session or require re-login

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| R-001 | Database migration failure | Medium | Create migration script with rollback plan |
| R-002 | bcrypt performance bottleneck | Low | Use appropriate cost factor (12), consider async |
| R-003 | Session token collision | Very Low | 256-bit random token makes collision impossible |
| R-004 | CSRF attacks | Medium | Use httpOnly cookies, consider CSRF tokens |
| R-005 | Rate limiting bypass | Low | Implement IP-based rate limiting |
| R-006 | Password hashing algorithm compromise | Low | Use bcrypt, monitor for vulnerabilities |

---

## Files to Create/Modify

### New Files (Phase 1)

| Path | Description |
|------|-------------|
| `src/server/db/schema-users.ts` | User, session, team Drizzle schemas |
| `src/server/trpc/routers/identity.ts` | Identity tRPC router |
| `src/server/trpc/lib/auth.ts` | Auth utility functions (hash, token) |
| `src/server/trpc/lib/rate-limit.ts` | Rate limiting middleware |
| `src/server/middleware.ts` | Next.js middleware for route protection |
| `src/app/(auth)/login/page.tsx` | Update with form logic |
| `src/app/(auth)/register/page.tsx` | Update with form logic |
| `src/components/auth/login-form.tsx` | Login form component with validation |
| `src/components/auth/register-form.tsx` | Register form component with validation |
| `src/lib/auth-client.ts` | Client-side auth utilities |

### Modified Files

| Path | Changes |
|------|---------|
| `src/server/db/schema.ts` | Add identity schema exports |
| `src/server/trpc/index.ts` | Add Context type with user/session |
| `src/server/trpc/procedures.ts` | Implement protectedProcedure logic |
| `src/server/trpc/router.ts` | Register identity router |
| `src/lib/trpc-provider.tsx` | Add auth token to headers |
| `src/app/layout.tsx` | Add session state provider |
| `src/components/layout/navbar.tsx` | Add user menu when authenticated |
| `drizzle.config.ts` | Update for PostgreSQL |
| `docker/docker-compose.yml` | Add PostgreSQL service |
| `.env.example` | Add database URL, session secret |

---

## Implementation Phases

### Phase 1: Core Authentication (Week 1)

**Goal:** Basic email/password authentication with session management

1. Database migration to PostgreSQL
2. Create user and session schemas
3. Implement password hashing utilities
4. Build auth tRPC procedures (register, login, logout, getSession)
5. Implement protectedProcedure
6. Create login/register forms with React Hook Form
7. Add auth token to tRPC client headers
8. Implement middleware for protected routes

**Acceptance:** User can register, login, access protected pages, logout

### Phase 2: User & Team Management (Week 2)

**Goal:** Profile management and team creation

1. Update profile procedure
2. Team CRUD procedures
3. Team member management
4. Profile settings page
5. Team management UI
6. Role-based access control checks

**Acceptance:** Users can update profiles, create teams, manage members

### Phase 3: Enhanced Security (Week 3)

**Goal:** Password reset, rate limiting, security hardening

1. Password reset token flow
2. Rate limiting middleware
3. Authentication event logging
4. Session management UI (view active sessions)
5. Security headers configuration
6. CSRF protection review

**Acceptance:** Password reset works, rate limiting active, security audit passed

### Phase 4: OAuth Integration (Optional, Week 4+)

**Goal:** GitHub and Google OAuth login

1. Install Auth.js or implement OAuth flow
2. Configure OAuth providers
3. Create account linking
4. OAuth login UI
5. Account settings (manage OAuth connections)

**Acceptance:** Users can login via GitHub/Google

---

## Testing Strategy

### Unit Tests

- `hashPassword()` - bcrypt integration
- `verifyPassword()` - password comparison
- `generateToken()` - token format validation
- Zod schema validation for all inputs

### Integration Tests

- Register -> Login -> Protected API flow
- Session creation and validation
- Team creation -> Member addition flow
- Rate limiting behavior

### E2E Tests (Playwright)

```typescript
test('user registration and login flow', async ({ page }) => {
  // Register
  await page.goto('/register')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'TestPass123')
  await page.fill('[name=name]', 'Test User')
  await page.click('button[type=submit]')

  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard')

  // Logout
  await page.click('[data-testid=user-menu]')
  await page.click('text=Logout')
  await expect(page).toHaveURL('/login')

  // Login
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'TestPass123')
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
})
```

---

## Dependencies to Install

```bash
# Core authentication
npm install bcrypt @types/bcrypt

# PostgreSQL (if not already)
npm install pg
npm install -D @types/pg

# Validation (already installed)
# zod, react-hook-form, @hookform/resolvers

# Forms (already installed)
# @radix-ui/react-*
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/plm

# Session
SESSION_SECRET=your-random-secret-key-min-32-chars

# OAuth (Phase 4)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Phase 3)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

---

## Success Metrics

- [ ] All Phase 1 acceptance criteria passed
- [ ] 85%+ test coverage for auth module
- [ ] No critical security vulnerabilities identified
- [ ] Session management works across page refreshes
- [ ] Protected routes properly redirect unauthenticated users
- [ ] tRPC protectedProcedure requires valid session
- [ ] Team RBAC correctly enforces permissions
- [ ] E2E tests pass for happy path and error cases
