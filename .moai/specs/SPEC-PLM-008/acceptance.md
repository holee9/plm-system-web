# Acceptance Criteria: SPEC-PLM-008

**SPEC ID**: SPEC-PLM-008
**Title**: Phase 1 Changes Commit and Cleanup

---

## Overview

This document defines the acceptance criteria and test scenarios for verifying that all accumulated changes are ready for commit. Each criterion follows Given-When-Then format for clear verification.

---

## Acceptance Criteria

### AC-001: SSE Notification System

#### AC-001.1: SSE Endpoint Authentication

**Given** a user attempts to connect to `/api/sse/notifications`
**When** the request includes a valid Auth.js JWT token
**Then** the connection is established successfully
**And** a connected event is sent to the client

**Given** a user attempts to connect to `/api/sse/notifications`
**When** the request does not include a valid token
**Then** a 401 Unauthorized response is returned
**And** no SSE stream is created

#### AC-001.2: SSE Connection Management

**Given** an authenticated SSE connection is established
**When** the connection remains open
**Then** keep-alive messages are sent every 30 seconds
**And** the connection state is tracked

**Given** an SSE connection is active
**When** the client disconnects (page unload, network loss)
**Then** the server cleans up the EventEmitter
**And** the client is removed from notificationClients map

#### AC-001.3: SSE Reconnection

**Given** an SSE connection is lost
**When** the client detects connection failure
**Then** reconnection is attempted after 3-second delay
**And** connection state is updated to disconnected

#### AC-001.4: SSE Notification Delivery

**Given** an SSE connection is established
**When** `sendNotificationToUser` is called with a notification
**Then** the notification is delivered to the connected client
**And** the client receives the notification event

**Given** an SSE connection is established
**When** `broadcastNotification` is called
**Then** the notification is delivered to all connected clients

#### AC-001.5: React Hook Integration

**Given** the `useSSENotifications` hook is used
**When** the component mounts
**Then** an EventSource connection is created
**And** `isConnected` state is updated on connection

**Given** the `useSSENotifications` hook is active
**When** a notification is received
**Then** a toast notification is displayed
**And** `lastNotification` state is updated
**And** tRPC queries are invalidated

---

### AC-002: Change Order Filtering

#### AC-002.1: Priority Filter

**Given** the change order list is displayed
**When** the user selects a priority filter (urgent/high/medium/low)
**Then** only change orders matching the selected priority are shown
**And** the filtered count is displayed

#### AC-002.2: Status Filter

**Given** the change order list is displayed
**When** the user selects a status filter
**Then** only change orders matching the selected status are shown

#### AC-002.3: Type Filter

**Given** the change order list is displayed
**When** the user selects a type filter (ECR/ECN)
**Then** only change orders matching the selected type are shown

#### AC-002.4: Combined Filters

**Given** the change order list is displayed
**When** multiple filters are applied (status + priority + type)
**Then** only change orders matching ALL filters are shown
**And** the filter state is maintained

#### AC-002.5: Search Functionality

**Given** the change order list is displayed
**When** the user enters a search query
**Then** change orders matching title, number, or description are shown
**And** search is case-insensitive

#### AC-002.6: Advanced Filter Panel

**Given** the change order page is displayed
**When** the user clicks the advanced filter toggle
**Then** the advanced filter panel expands/collapses
**And** additional filter options are shown/hidden

---

### AC-003: Dashboard Period Selection

#### AC-003.1: Period Selector UI

**Given** the project dashboard is displayed
**When** the page loads
**Then** a period selector dropdown is visible
**And** "All Periods" is selected by default

#### AC-003.2: Period Selection

**Given** the period selector is displayed
**When** the user selects a period (7d, 30d, 90d, 1y)
**Then** the dashboard data is refreshed
**And** only data within the selected period is shown

#### AC-003.3: Date Range Calculation

**Given** the user selects "Last 7 Days"
**When** the period is applied
**Then** start date is 7 days ago (start of day)
**And** end date is today (end of day)

**Given** the user selects "Last 30 Days"
**When** the period is applied
**Then** start date is 30 days ago (start of day)
**And** end date is today (end of day)

**Given** the user selects "Last 3 Months"
**When** the period is applied
**Then** start date is 90 days ago (start of day)
**And** end date is today (end of day)

**Given** the user selects "Last 1 Year"
**When** the period is applied
**Then** start date is 1 year ago (start of day)
**And** end date is today (end of day)

#### AC-003.4: Query Integration

**Given** a period is selected
**When** dashboard queries are executed
**Then** startDate and endDate parameters are included
**And** statistics, charts, and activities are filtered

**Given** "All Periods" is selected
**When** dashboard queries are executed
**Then** date parameters are omitted
**And** all data is returned

---

### AC-004: Test Coverage

#### AC-004.1: Unit Tests Pass

**Given** the test suite is executed
**When** `npm test` is run
**Then** all unit tests pass
**And** no test failures are reported

#### AC-004.2: Type Check Pass

**Given** TypeScript compilation is executed
**When** `npm run typecheck` is run
**Then** zero type errors are reported
**And** compilation succeeds

#### AC-004.3: Lint Check Pass

**Given** the linter is executed
**When** `npm run lint` is run
**Then** zero lint errors are reported
**And** code follows project style guidelines

#### AC-004.4: Coverage Threshold

**Given** test coverage is measured
**When** the coverage report is generated
**Then** overall coverage is at least 85%
**And** no critical modules have coverage below 80%

---

### AC-005: Git Commit Organization

#### AC-005.1: SSE Commit

**Given** SSE changes are staged
**When** the commit is created
**Then** the commit message follows format `feat(notification): ...`
**And** SPEC reference is included
**And** all SSE-related files are included

#### AC-005.2: Filter Commit

**Given** filter changes are staged
**When** the commit is created
**Then** the commit message follows format `feat(change-order): ...`
**And** SPEC reference is included

#### AC-005.3: Dashboard Commit

**Given** dashboard changes are staged
**When** the commit is created
**Then** the commit message follows format `feat(dashboard): ...`
**And** SPEC reference is included

#### AC-005.4: Test Commit

**Given** test files are staged
**When** the commit is created
**Then** the commit message follows format `test(project): ...`
**And** all new test files are included

#### AC-005.5: Clean Working Tree

**Given** all commits are created
**When** `git status` is executed
**Then** the working tree is clean
**And** no unstaged changes remain

---

## Test Scenarios

### Scenario 1: End-to-End SSE Flow

```
1. User logs in with valid credentials
2. User navigates to any page with notification listener
3. SSE connection is established automatically
4. Connection state shows "connected"
5. Another user triggers a notification event
6. Notification appears as toast
7. User clicks notification
8. Navigation to linked page occurs
9. User closes browser tab
10. Server cleans up connection
```

### Scenario 2: Filter Combination Test

```
1. User navigates to change order list
2. User selects "High" priority filter
3. List shows only high priority items
4. User selects "ECR" type filter
5. List shows only high priority ECR items
6. User enters "test" in search
7. List shows only high priority ECR items matching "test"
8. User clears all filters
9. List shows all items
```

### Scenario 3: Dashboard Period Interaction

```
1. User navigates to project dashboard
2. Dashboard shows all-time statistics
3. User selects "Last 7 Days"
4. All statistics update to show only last 7 days
5. Charts refresh with filtered data
6. User selects "Last 30 Days"
7. Statistics update to show last 30 days
8. User selects "All Periods"
9. Dashboard returns to all-time view
```

### Scenario 4: Pre-Commit Verification

```
1. Developer runs `npm run typecheck`
2. TypeScript compilation succeeds with no errors
3. Developer runs `npm run lint`
4. Biome reports no errors
5. Developer runs `npm test`
6. All tests pass
7. Developer stages changes
8. Developer creates commits in order
9. Developer runs `git status`
10. Working tree is clean
```

---

## Quality Gate Checklist

### Before Commit

- [ ] All acceptance criteria verified
- [ ] Unit tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] No console errors in browser
- [ ] Manual testing completed

### After Commit

- [ ] Commit history verified
- [ ] Commit messages follow Conventional Commits
- [ ] SPEC references included in commits
- [ ] Working tree is clean
- [ ] Documentation updated (if applicable)

---

## Edge Cases

### EC-001: SSE Connection Limits

**Given** multiple tabs are open with SSE connections
**When** the user exceeds browser connection limits
**Then** appropriate error handling occurs
**And** reconnection is attempted when possible

### EC-002: Filter with No Results

**Given** filters are applied
**When** no change orders match the criteria
**Then** an empty state message is displayed
**And** the user is prompted to adjust filters

### EC-003: Dashboard with No Data

**Given** a period is selected
**When** no data exists for that period
**Then** appropriate empty state is shown
**And** zero values are displayed correctly

### EC-004: Network Interruption During SSE

**Given** an SSE connection is active
**When** network is temporarily interrupted
**Then** reconnection is attempted automatically
**And** missed notifications are requested (if implemented)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All test scenarios pass
- [ ] Quality gate checklist complete
- [ ] Edge cases handled
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Changes committed to main branch
- [ ] No regressions introduced
