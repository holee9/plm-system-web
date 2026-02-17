# Technical Debt Analysis Report - PLM System Web

## Executive Summary

This analysis identified significant technical debt across TypeScript type safety, test coverage, and code quality areas. The project has 276 source files but only 26 test files, indicating approximately 9% test coverage against the 85% target.

---

## 1. TypeScript Issues

### 1.1 Excessive `any` Type Usage (60+ occurrences)

**Critical Files:**

| File | Line | Issue | Severity |
|------|------|-------|----------|
| `src/modules/plm/types.ts` | 66-67, 76 | `oldValue: any`, `newValue: any` in change tracking types | High |
| `src/modules/plm/service.ts` | 335, 384 | `Record<string, { oldValue: any; newValue: any }>`, `updateData: any` | High |
| `src/modules/plm/manufacturer-service.ts` | 185, 491 | `conditions: any[]` for SQL query building | Medium |
| `src/modules/plm/change-order-service.ts` | 388 | `updateData: any` | High |
| `src/components/plm/SupplierSelector.tsx` | 15, 61, 74, 96, 102, 144 | Multiple `any[]` and `any` types for supplier data | High |
| `src/components/plm/ManufacturerSelector.tsx` | 15, 61, 74, 96, 102, 144 | Identical pattern to SupplierSelector | High |
| `src/server/trpc/middleware/is-authed.ts` | 35 | `next: any` in middleware function signature | Medium |
| `src/server/trpc/middleware/authorization.ts` | 24 | `next: any` in middleware function signature | Medium |

**Specific Code Examples:**

```typescript
// src/modules/plm/types.ts - Generic change tracking
export interface RevisionWithChanges extends Omit<Revision, "changes"> {
  changes?: {
    field: string;
    oldValue: any;  // Should be: unknown | JsonValue
    newValue: any;  // Should be: unknown | JsonValue
  }[];
}

// src/modules/plm/service.ts - Dynamic update data
const updateData: any = {  // Should use Drizzle's Update type
  updatedAt: sql`now()`,
  currentRevisionId: revision.id,
};
```

### 1.2 No `@ts-ignore` or `@ts-nocheck` Found

Positive: No TypeScript suppression comments found, indicating type errors are being addressed properly.

---

## 2. Code Quality Issues

### 2.1 TODO Comments (45+ instances)

**High Priority TODOs:**

| File | TODO | Priority |
|------|------|----------|
| `src/modules/plm/change-order-service.ts` | "Add details for each item efficiently" | High |
| `src/modules/plm/router.ts` | "Implement getRevisionById" | High |
| `src/app/api/attachments/[id]/download/route.ts` | "Verify user has access to parent issue" | **Critical** |
| `src/modules/issue/service.ts` | "Implement cursor-based pagination" | Medium |
| `src/server/trpc/routers/auth.ts` | "Send verification email with token" | Medium |
| `src/modules/issue/attachment-api.ts` | "Replace with actual auth once implemented" | High |

### 2.2 Code Duplication

**Identical Component Patterns:**
- `src/components/plm/SupplierSelector.tsx` and `src/components/plm/ManufacturerSelector.tsx`
  - Nearly identical logic (150+ lines each)
  - Only difference: entity type (supplier vs manufacturer)
  - Should be refactored into a single generic component

**Recommendation:** Create `EntitySelector<T>` generic component with type-safe configuration.

### 2.3 Missing Error Handling

**Files with incomplete error handling:**
- `src/app/api/attachments/[id]/download/route.ts` - No authentication check (line 40-49)
- `src/modules/notification/router.ts` - No actual user context validation

---

## 3. Test Coverage Gaps

### 3.1 Current State

- **Source files:** 276 TypeScript/TSX files
- **Test files:** 26 test files
- **Estimated coverage:** ~9% (far below 85% target)

### 3.2 Missing Test Coverage

**Untested Critical Paths:**

1. **PLM Module** - No integration tests for:
   - Part creation/update workflow
   - Revision tracking
   - BOM management
   - Manufacturer/Supplier linking

2. **Authentication Flow** - Partial coverage:
   - Has: `tests/unit/utils/jwt.test.ts`, `tests/integration/trpc/auth.test.ts`
   - Missing: Password reset flow, session management edge cases

3. **Change Order System** - No tests found for:
   - `src/modules/plm/change-order-service.ts`
   - Approval workflow
   - Impact analysis

4. **Dashboard/Analytics** - No tests for:
   - `src/modules/dashboard/router.ts`
   - Aggregation queries

### 3.3 Test File Locations

**Existing Tests:**
```
tests/
├── unit/
│   ├── auth-router.test.ts
│   ├── jwt.test.ts
│   ├── password.test.ts
│   ├── trpc.test.ts
│   ├── trpc/middleware.test.ts
│   ├── trpc/procedures.test.ts
│   ├── components/auth/*.test.tsx
│   ├── plm/revision-utils.test.ts
│   └── plm/bom-utils.test.ts
├── integration/
│   └── trpc/
│       ├── auth.test.ts
│       └── middleware.spec.test.ts
└── e2e/
    ├── health.spec.ts
    ├── auth-flow.spec.ts
    ├── profile.spec.ts
    └── sessions.spec.ts
```

---

## 4. Performance Considerations

### 4.1 Potential N+1 Query Issues

**Files with sequential database operations:**

| File | Lines | Issue |
|------|-------|-------|
| `src/modules/plm/manufacturer-service.ts` | 218-227 | Fetches parts count for each manufacturer separately |
| `src/app/projects/[key]/issues/page.tsx` | Multiple sequential queries for project data |
| `src/server/trpc/routers/user.ts` | 207-220 | Session queries could be batched |

**Code Example:**
```typescript
// src/modules/plm/manufacturer-service.ts:218-227
// Potential N+1: Queries parts count for each manufacturer individually
const manufacturerIds = manufacturersList.map(m => m.id);
const partsCounts = manufacturerIds.length > 0
  ? await db.select({...})
      .from(partsManufacturers)
      .where(inArray(partsManufacturers.manufacturerId, manufacturerIds))
      .groupBy(partsManufacturers.manufacturerId)
```

### 4.2 Missing React Optimizations

**Components missing `useMemo`/`useCallback`:**
- `src/components/plm/PartList.tsx` - Computed categories without memoization
- `src/components/changes/change-order-list.tsx` - Has `useMemo` but only for filtering
- `src/app/projects/[key]/dashboard/dashboard-client.tsx` - Multiple `.filter()` operations on every render

**Example:**
```typescript
// dashboard-client.tsx:66-70 - Not memoized
const openIssues = issues.filter((i: any) => i.status === "open").length;
const inProgressIssues = issues.filter((i: any) => i.status === "in_progress").length;
// ... 5 more filters running on every render
```

---

## 5. Security Review

### 5.1 Critical Security Issues

| Severity | File | Issue |
|----------|------|-------|
| **HIGH** | `src/app/api/attachments/[id]/download/route.ts:40` | Missing authentication check - anyone can download attachments |
| **MEDIUM** | `src/modules/notification/router.ts:7-12` | TODO: Replace with actual auth context |
| **LOW** | `src/server/trpc/middleware/authorization.ts` | RBAC implemented but roles not fully populated from DB |

### 5.2 Input Validation

**Positive findings:**
- Zod schemas used for tRPC input validation
- Password validation implemented with bcrypt-ts
- SQL injection protection via Drizzle ORM parameterized queries

**Areas for improvement:**
- File upload validation in attachment service (size, type)
- Rate limiting on authentication endpoints (noted in ATTACHMENT-IMPLEMENTATION.md)

### 5.3 Authorization Coverage

**Middleware exists but may not be consistently applied:**
- `isAuthed` - JWT verification
- `authorized` - RBAC with roles
- Some procedures lack proper middleware application

---

## 6. Specific Recommendations

### 6.1 Immediate Actions (P0)

1. **Fix attachment download security vulnerability**
   - File: `src/app/api/attachments/[id]/download/route.ts`
   - Action: Implement authentication before file access

2. **Replace critical `any` types with proper types**
   - Priority: `src/modules/plm/types.ts`, `src/modules/plm/service.ts`
   - Action: Use Drizzle's JSON types or define union types

### 6.2 Short-term Improvements (P1)

1. **Refactor duplicate Selector components**
   - Create generic `EntitySelector<T>` component
   - Eliminate 300+ lines of duplicated code

2. **Add test coverage for critical paths**
   - PLM module: Part/Revision/BOM workflows
   - Change Order system
   - Dashboard aggregations

3. **Implement pending TODOs**
   - getRevisionById in plm/router.ts
   - Cursor-based pagination in issue/service.ts

### 6.3 Long-term Improvements (P2)

1. **Achieve 85% test coverage**
   - Current: ~9%
   - Target: Add ~200 test files

2. **Performance optimization**
   - Batch queries to prevent N+1 issues
   - Add React.memo/useMemo for expensive computations

3. **Type safety improvements**
   - Eliminate all remaining `any` types
   - Enable stricter TypeScript compiler options

---

## 7. File Impact Summary

### Files Requiring Immediate Attention

| File | Issue Type | Action Required |
|------|------------|-----------------|
| `src/app/api/attachments/[id]/download/route.ts` | Security | Add auth check |
| `src/modules/plm/types.ts` | Type safety | Replace `any` with proper types |
| `src/components/plm/SupplierSelector.tsx` | Duplication | Refactor to generic component |
| `src/components/plm/ManufacturerSelector.tsx` | Duplication | Refactor to generic component |
| `src/modules/plm/change-order-service.ts` | Test coverage | Add integration tests |
| `src/app/projects/[key]/dashboard/dashboard-client.tsx` | Performance | Add useMemo for filters |

---

## 8. Metrics Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Test Coverage | ~9% | 85% | -76% |
| Type Safety | ~60 `any` usages | 0 | -60 |
| Security Issues | 1 HIGH, 2 MEDIUM | 0 | -3 |
| TODO Comments | 45+ | <10 | -35 |
| Code Duplication | ~300 lines | 0 | -300 |
