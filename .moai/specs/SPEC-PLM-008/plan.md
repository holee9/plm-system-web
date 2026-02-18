# Implementation Plan: SPEC-PLM-008

**SPEC ID**: SPEC-PLM-008
**Title**: Phase 1 Changes Commit and Cleanup
**Development Mode**: Hybrid (TDD for new tests, DDD for existing code verification)

---

## Milestones

### Primary Goal: Verification and Testing

**Priority**: High
**Objective**: Verify all existing implementations work correctly

#### Tasks

1. **Run Unit Tests**
   - Execute `npm test` to run all Vitest unit tests
   - Verify all existing tests pass
   - Document any failures for investigation

2. **Run Type Check**
   - Execute `npm run typecheck` for TypeScript validation
   - Ensure zero type errors
   - Fix any type issues found

3. **Run Lint Check**
   - Execute `npm run lint` with Biome
   - Address any linting errors
   - Run `npm run lint:fix` for auto-fixable issues

4. **Run Integration Tests**
   - Execute `npm run test:e2e` for Playwright tests (if applicable)
   - Verify critical user flows work

### Secondary Goal: Git Commit Organization

**Priority**: High
**Objective**: Organize and commit changes in logical groups

#### Commit Plan

**Commit 1: SSE Notification Implementation**
```
feat(notification): implement SSE real-time notifications

- Add /api/sse/notifications endpoint with Auth.js v5 integration
- Implement useSSENotifications hook with reconnection logic
- Add useSSENotificationsWithOptions for custom handlers
- Support keep-alive messages and connection state tracking

Refs: SPEC-PLM-008, SPEC-PLM-007 D-005
```

**Files to include:**
- `src/app/api/sse/notifications/route.ts`
- `src/hooks/use-sse-notifications.ts`

**Commit 2: Change Order Filtering Enhancement**
```
feat(change-order): add priority and advanced filtering

- Add priority filter dropdown (urgent/high/medium/low)
- Implement advanced filter panel toggle
- Support combined filtering by status, type, and priority
- Add search functionality for title, number, description

Refs: SPEC-PLM-008, SPEC-PLM-006 C-001, C-002
```

**Files to include:**
- `src/app/projects/[key]/changes/change-order-list-client.tsx`
- `src/components/changes/change-order-list.tsx`

**Commit 3: Dashboard Period Selection**
```
feat(dashboard): add period selection for data filtering

- Add period selector UI (all, 7d, 30d, 90d, 1y)
- Integrate date range with tRPC queries
- Apply period filter to all dashboard statistics
- Support date-fns for date calculations

Refs: SPEC-PLM-008, SPEC-PLM-007 D-014
```

**Files to include:**
- `src/app/projects/[key]/dashboard/dashboard-client.tsx`

**Commit 4: Project Module Tests**
```
test(project): add integration and unit tests

- Add integration tests for project CRUD flows
- Add unit tests for project service layer
- Add schema validation tests
- Add error handling tests
- Add async operation tests

Refs: SPEC-PLM-008
```

**Files to include:**
- `tests/integration/project/*.test.ts`
- `tests/unit/project/*.test.ts`
- `src/modules/project/__tests__/*` (if any)

**Commit 5: Documentation Update (Optional)**
```
docs: update README with Phase 3 completion status

- Update implementation progress table
- Add new features to completed list
- Update remaining work section

Refs: SPEC-PLM-008
```

**Files to include:**
- `README.md`

### Tertiary Goal: Quality Validation

**Priority**: Medium
**Objective**: Ensure TRUST 5 compliance

#### Validation Checklist

1. **Tested**
   - [ ] Unit tests pass: `npm test`
   - [ ] Type check passes: `npm run typecheck`
   - [ ] Coverage report generated
   - [ ] Coverage meets 85% threshold

2. **Readable**
   - [ ] Code follows naming conventions
   - [ ] Comments in English
   - [ ] No dead code

3. **Unified**
   - [ ] Lint check passes: `npm run lint`
   - [ ] Format applied: `npm run format`
   - [ ] Consistent style across files

4. **Secured**
   - [ ] SSE endpoint requires authentication
   - [ ] No secrets in code
   - [ ] Input validation present

5. **Trackable**
   - [ ] Commits follow Conventional Commits
   - [ ] SPEC references in commit messages
   - [ ] Clear commit boundaries

---

## Technical Approach

### SSE Verification Strategy

1. **Code Review Points**
   - Auth.js v5 integration correctness
   - EventEmitter cleanup on disconnect
   - Keep-alive interval cleanup
   - Error handling completeness

2. **Manual Testing**
   - Connect to SSE endpoint with valid token
   - Verify keep-alive messages received
   - Test reconnection after disconnect
   - Verify cleanup on page unload

### Filter Verification Strategy

1. **Unit Testing**
   - Test filter logic in isolation
   - Test combined filter scenarios
   - Test search query matching

2. **Integration Testing**
   - Test filter UI interaction
   - Test URL parameter sync (if implemented)
   - Test filter persistence

### Dashboard Period Verification Strategy

1. **Unit Testing**
   - Test date range calculation
   - Test period preset selection

2. **Integration Testing**
   - Test API query with date parameters
   - Test chart data refresh
   - Test statistics recalculation

---

## File Dependency Graph

```
SSE Implementation:
  route.ts (standalone)
  use-sse-notifications.ts (depends on route.ts endpoint)

Change Order Filtering:
  change-order-list-client.tsx (parent component)
    └── change-order-list.tsx (child component)

Dashboard Period:
  dashboard-client.tsx (standalone)
    └── tRPC queries (depends on router)

Tests:
  All test files are independent
  Depend on implementation files being stable
```

---

## Execution Order

### Phase 1: Pre-Commit Verification (Priority High)

```
Step 1: Run type check
$ npm run typecheck

Step 2: Run lint check
$ npm run lint

Step 3: Fix any lint issues
$ npm run lint:fix

Step 4: Run unit tests
$ npm test

Step 5: Verify coverage
$ npm test -- --coverage
```

### Phase 2: Commit Execution (Priority High)

```
Step 1: Stage and commit SSE changes
$ git add src/app/api/sse/ src/hooks/use-sse-notifications.ts
$ git commit

Step 2: Stage and commit filter changes
$ git add src/app/projects/[key]/changes/ src/components/changes/
$ git commit

Step 3: Stage and commit dashboard changes
$ git add src/app/projects/[key]/dashboard/
$ git commit

Step 4: Stage and commit test files
$ git add tests/ src/modules/project/__tests__/
$ git commit

Step 5: Stage and commit docs (optional)
$ git add README.md CHANGELOG.md
$ git commit
```

### Phase 3: Post-Commit Validation (Priority Medium)

```
Step 1: Verify commit history
$ git log --oneline -5

Step 2: Verify clean working tree
$ git status

Step 3: Push changes (if approved)
$ git push origin main
```

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Test failures | Debug and fix before committing |
| Type errors | Address immediately, do not commit with errors |
| Large commits | Split into logical groups as planned |
| Merge conflicts | Pull latest before committing |

---

## Success Criteria

- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] Coverage meets 85% threshold
- [ ] All changes committed in logical groups
- [ ] Commit messages follow Conventional Commits
- [ ] Git working tree is clean
- [ ] Documentation updated (README, CHANGELOG)

---

## Next Steps

After SPEC-PLM-008 completion:

1. Run `/moai:2-run SPEC-PLM-008` for implementation verification
2. Execute `/moai:3-sync SPEC-PLM-008` for documentation sync
3. Continue with remaining P3 features from SPEC-PLM-006/007

---

## Expert Consultation Recommendations

### Required Consultations

1. **expert-backend**: SSE endpoint implementation review
   - Connection management best practices
   - Memory leak prevention
   - Authentication flow verification

2. **expert-frontend**: Filter and dashboard UI review
   - User experience optimization
   - Accessibility compliance
   - Performance considerations

3. **expert-testing**: Test coverage verification
   - Test strategy review
   - Coverage gap identification
   - Integration test design

### Optional Consultations

- **expert-devops**: Deployment considerations for SSE
- **expert-security**: Security review for real-time connections
