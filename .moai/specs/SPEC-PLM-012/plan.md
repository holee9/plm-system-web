# SPEC-PLM-012: Implementation Plan

## Metadata

- ID: SPEC-PLM-012
- Status: Draft
- Priority: P3
- Dependencies: SPEC-PLM-003
- Created: 2026-02-18

---

## Implementation Strategy

### Development Mode: Hybrid

- **New Code**: TDD (RED-GREEN-REFACTOR) - 위젯 컴포넌트, 훅, 서비스
- **Existing Code**: DDD (ANALYZE-PRESERVE-IMPROVE) - 대시보드 페이지, 기존 위젯 래핑

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| UI Framework | Next.js App Router | 15.0 |
| UI Library | React | 19.0 |
| Drag & Drop | @dnd-kit/core + sortable | ^6.1.0 |
| State Management | Zustand + TanStack Query | 5.0 |
| Styling | Tailwind CSS + shadcn/ui | 4.0 |
| Database | PostgreSQL + Drizzle ORM | 16 |
| API | tRPC | 11.0 |
| Validation | Zod | 3.23 |

---

## Milestones

### Milestone 1: Foundation (Core Infrastructure)

**Priority: Primary Goal**

**Deliverables:**
- Database schema (user_dashboards, dashboard_templates)
- tRPC router scaffold
- Widget type definitions
- Layout config schema (Zod)

**Files:**
- `src/modules/dashboard/schemas/dashboards.ts`
- `src/modules/dashboard/schemas/templates.ts`
- `src/modules/dashboard/widget-types.ts`
- `src/modules/dashboard/router.ts` (scaffold)
- `src/server/db/schema.ts` (update)

**Validation:**
- Drizzle migration runs successfully
- tRPC router registered and health check passes
- Zod schema validation works

---

### Milestone 2: Drag & Drop Grid System

**Priority: Primary Goal**

**Deliverables:**
- WidgetGrid component (CSS Grid based)
- WidgetWrapper component (draggable/resizable)
- useWidgetDrag hook
- useDashboardLayout hook

**Files:**
- `src/components/dashboard/widget-grid.tsx`
- `src/components/dashboard/widget-wrapper.tsx`
- `src/hooks/use-widget-drag.ts`
- `src/hooks/use-dashboard-layout.ts`

**Validation:**
- Widgets can be dragged and dropped
- Widget positions update in real-time
- Grid reflows correctly on resize

---

### Milestone 3: Widget Management

**Priority: Primary Goal**

**Deliverables:**
- WidgetPalette component (add widgets panel)
- WidgetConfig component (per-widget settings)
- Existing widgets wrapped for grid compatibility
- Widget add/remove/resize operations

**Files:**
- `src/components/dashboard/widget-palette.tsx`
- `src/components/dashboard/widget-config.tsx`
- Update existing: `stat-card.tsx`, `activity-feed.tsx`, etc.

**Validation:**
- All widget types can be added
- Widgets can be removed
- Widget configuration persists

---

### Milestone 4: Layout Persistence

**Priority: Secondary Goal**

**Deliverables:**
- Full tRPC router implementation
- Auto-save layout on change (debounced)
- Layout restoration on page load
- Reset to default layout

**Files:**
- `src/modules/dashboard/router.ts` (full implementation)
- `src/modules/dashboard/widget-service.ts`
- `src/app/projects/[key]/dashboard/custom/page.tsx`

**Validation:**
- Layout saves automatically after changes
- Layout restores correctly on page reload
- Reset function works

---

### Milestone 5: Template System

**Priority: Secondary Goal**

**Deliverables:**
- TemplateDialog component
- Save current layout as template
- Apply template to dashboard
- Template listing and deletion

**Files:**
- `src/components/dashboard/template-dialog.tsx`
- `src/components/dashboard/layout-preview.tsx`
- Update router with template procedures

**Validation:**
- Templates can be saved
- Templates can be applied
- Templates can be deleted

---

### Milestone 6: Multi-Dashboard Tabs

**Priority: Secondary Goal**

**Deliverables:**
- DashboardTabs component
- Create new dashboard tab
- Rename dashboard tab
- Delete dashboard tab (with minimum 1 enforcement)

**Files:**
- `src/components/dashboard/dashboard-tabs.tsx`
- Update page and router for multi-dashboard

**Validation:**
- Multiple dashboards can be created
- Tabs can be renamed
- Tabs can be deleted (except last one)

---

### Milestone 7: Polish & Testing

**Priority: Final Goal**

**Deliverables:**
- Unit tests (85%+ coverage)
- Integration tests
- E2E tests for critical flows
- Touch device support
- Mobile responsive layout
- Error states and loading skeletons

**Files:**
- `tests/unit/dashboard/*.test.ts`
- `tests/integration/dashboard/*.test.ts`
- `tests/e2e/dashboard.spec.ts`

**Validation:**
- All tests pass
- Coverage >= 85%
- Works on mobile devices

---

## Technical Approach

### Grid Layout Strategy

CSS Grid를 기반으로 한 12열 그리드 시스템을 사용합니다:

```
+--+--+--+--+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |  |  |  |  |  12 columns
+--+--+--+--+--+--+--+--+--+--+--+--+
```

**Widget Sizing:**
- Small: 3 columns (1/4 width)
- Medium: 6 columns (1/2 width)
- Large: 9 columns (3/4 width)
- Full: 12 columns (full width)
- Height: 80px 단위 (1, 2, 3, 4 units)

### Drag & Drop Implementation

@dnd-kit 라이브러리를 활용하여 칸반 보드와 동일한 패턴 적용:

```typescript
// Sensor configuration for smooth dragging
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px movement to start
    },
  }),
  useSensor(KeyboardSensor),
  useSensor(TouchSensor) // Mobile support
);
```

### State Management

**Client State (Zustand):**
- Active dashboard ID
- Edit mode state
- Drag state

**Server State (TanStack Query + tRPC):**
- Dashboard layouts
- Templates
- Widget data

### Auto-Save Strategy

Debounce를 사용하여 사용자 입력이 멈춘 후 500ms 뒤 자동 저장:

```typescript
const debouncedSave = useDebounce(
  (layout) => trpc.dashboard.saveLayout.mutate(layout),
  500
);
```

### Existing Widget Integration

기존 위젯 컴포넌트를 WidgetWrapper로 래핑:

```typescript
// Before
<StatCard icon={FolderKanban} value="5" label="Projects" />

// After (in grid)
<WidgetWrapper id="widget-1" position={{x:0,y:0,w:3,h:1}}>
  <StatCard icon={FolderKanban} value="5" label="Projects" />
</WidgetWrapper>
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Custom Dashboard Page                 │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              DashboardTabs                        │   │
│  │  [Tab 1] [Tab 2] [+]                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────┐  ┌──────────────────────────────────┐   │
│  │ Widget   │  │         WidgetGrid                │   │
│  │ Palette  │  │  ┌─────┐ ┌─────┐ ┌───────────┐   │   │
│  │          │  │  │ W1  │ │ W2  │ │    W3     │   │   │
│  │ [Stat]   │  │  └─────┘ └─────┘ └───────────┘   │   │
│  │ [Chart]  │  │  ┌───────────┐ ┌─────┐ ┌─────┐   │   │
│  │ [List]   │  │  │    W4     │ │ W5  │ │ W6  │   │   │
│  │ [Card]   │  │  └───────────┘ └─────┘ └─────┘   │   │
│  │          │  │                                  │   │
│  └──────────┘  └──────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              TemplateDialog                       │   │
│  │  [Save Template] [Load Template] [Reset]         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Data Flow:
Page -> useDashboardLayout hook -> Zustand (edit mode)
                            -> tRPC (layout data) -> PostgreSQL
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Drag performance on many widgets | Limit max widgets to 20 per dashboard |
| Layout migration | Version field in JSON, migration functions |
| Touch device issues | Test on real devices, use TouchSensor |
| Auto-save conflicts | Optimistic updates + server reconciliation |

---

## Dependencies Check

- [x] @dnd-kit/core installed (existing)
- [x] @dnd-kit/sortable installed (existing)
- [x] @dnd-kit/utilities installed (existing)
- [x] tRPC router pattern established
- [x] Drizzle ORM configured
- [x] Existing dashboard components available

---

## Estimated Scope

| Category | Count |
|----------|-------|
| New Files | ~15 |
| Modified Files | ~4 |
| Database Tables | 2 |
| tRPC Procedures | 11 |
| Components | 7 |
| Hooks | 2 |
| Tests | ~8 |

---

## Next Steps

1. Run `/moai:2-run SPEC-PLM-012` to begin implementation
2. Start with Milestone 1 (Foundation)
3. Progress through milestones sequentially
4. Validate each milestone before proceeding
