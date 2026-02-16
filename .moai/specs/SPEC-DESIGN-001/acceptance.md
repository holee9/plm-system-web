# Acceptance Criteria: Pencil MCP-based Design System

## Metadata

| Field        | Value                                        |
|--------------|----------------------------------------------|
| SPEC ID      | SPEC-DESIGN-001                              |
| Created      | 2026-02-16                                   |
| Format       | Gherkin (Given-When-Then)                    |

---

## 1. Design Token System

### AC-001: Token Single Source of Truth

**Given** a developer needs to update design values
**When** they modify `design-tokens.json`
**Then** all consuming components reflect the changes
**And** CSS custom properties are regenerated
**And** Tailwind classes are updated
**And** TypeScript types remain valid

### AC-002: Light/Dark Theme Support

**Given** a user prefers dark mode
**When** they toggle theme preference
**Then** all components switch to dark theme
**And** the transition is smooth (no flash)
**And** the preference is persisted
**And** system preference is respected by default

### AC-003: Token Type Safety

**Given** a developer uses design tokens
**When** they reference a token value
**Then** TypeScript provides autocomplete
**And** invalid token references cause compile errors
**And** token types are exported from `design-tokens.ts`

---

## 2. Base Components (shadcn/ui Extended)

### AC-004: Button Component Tokens

**Given** a Button component with PLM tokens
**When** rendered with default props
**Then** it uses design token colors
**And** spacing follows token values
**And** border radius matches token definition

**Variants:**
| Variant    | Color Token              | Use Case           |
|------------|--------------------------|---------------------|
| default    | primary                  | Primary actions    |
| destructive| destructive              | Delete, remove     |
| outline    | background + border      | Secondary actions  |
| ghost      | transparent              | Tertiary actions   |

### AC-005: Input Component Tokens

**Given** an Input component with PLM tokens
**When** rendered in any state
**Then** border color uses token
**And** focus ring uses accent token
**And** error state uses destructive token
**And** background uses background token

### AC-006: Accessibility for Base Components

**Given** any base component
**When** rendered in the browser
**Then** all interactive elements are focusable
**And** focus indicator is visible
**And** color contrast ratio >= 4.5:1
**And** screen reader announces component purpose

---

## 3. PLM Components

### 3.1 Data Grid Component

#### AC-007: Data Grid Basic Rendering

**Given** a Data Grid with column definitions and data
**When** the component renders
**Then** all columns are displayed
**And** all rows are rendered
**And** headers are sticky on scroll
**And** column widths are adjustable

#### AC-008: Data Grid Sorting

**Given** a Data Grid with sortable columns
**When** a user clicks a column header
**Then** data is sorted by that column
**And** sort indicator appears (asc/desc)
**And** sort state is accessible via props

#### AC-009: Data Grid Filtering

**Given** a Data Grid with filterable columns
**When** a user enters filter criteria
**Then** only matching rows are displayed
**And** filter state is accessible via props
**And** clear filter action is available

#### AC-010: Data Grid Pagination

**Given** a Data Grid with more rows than page size
**When** the component renders
**Then** pagination controls are displayed
**And** page size selector is available
**And** current page indicator is shown
**And** total row count is displayed

#### AC-011: Data Grid Row Selection

**Given** a Data Grid with row selection enabled
**When** a user clicks a row
**Then** the row is selected
**And** selection state is accessible via props
**And** multi-select is supported with checkbox
**And** select all functionality works

#### AC-012: Data Grid Responsive Behavior

**Given** a Data Grid on mobile viewport
**When** the viewport width < 768px
**Then** columns adapt to available space
**And** horizontal scroll is available if needed
**And** priority columns remain visible
**And** touch interactions work correctly

### 3.2 Tree View Component

#### AC-013: Tree View Basic Rendering

**Given** a Tree View with hierarchical data
**When** the component renders
**Then** root nodes are displayed
**And** expand icons are shown for nodes with children
**And** indentation reflects hierarchy level

#### AC-014: Tree View Expand/Collapse

**Given** a Tree View with nested nodes
**When** a user clicks expand icon
**Then** child nodes are revealed
**And** expand icon changes to collapse
**When** a user clicks collapse icon
**Then** child nodes are hidden
**And** collapse icon changes to expand

#### AC-015: Tree View Selection

**Given** a Tree View with selection enabled
**When** a user clicks a node
**Then** the node is selected
**And** selection state is accessible via props
**And** selection highlights the node
**And** parent selection cascades to children (optional)

#### AC-016: Tree View Keyboard Navigation

**Given** a Tree View with focus
**When** user presses Arrow Right
**Then** node expands if collapsed
**When** user presses Arrow Left
**Then** node collapses if expanded
**When** user presses Arrow Down
**Then** focus moves to next visible node
**When** user presses Arrow Up
**Then** focus moves to previous visible node

#### AC-017: Tree View Lazy Loading

**Given** a Tree View with lazy loading enabled
**When** a user expands a node
**Then** loading indicator appears
**And** children are fetched asynchronously
**And** children are displayed when loaded
**And** error state is handled gracefully

### 3.3 Kanban Board Component

#### AC-018: Kanban Board Basic Rendering

**Given** a Kanban Board with columns and cards
**When** the component renders
**Then** all columns are displayed
**And** cards are in their respective columns
**And** column headers show card count

#### AC-019: Kanban Board Drag and Drop

**Given** a Kanban Board with drag enabled
**When** a user drags a card
**Then** card follows cursor
**And** drop zones are highlighted
**When** a user drops a card in new column
**Then** card moves to new column
**And** onCardMove callback is fired

#### AC-020: Kanban Board WIP Limits

**Given** a Kanban column with WIP limit
**When** the column reaches WIP limit
**Then** no more cards can be added
**And** visual warning is displayed
**And** drop action is prevented

#### AC-021: Kanban Board Accessibility

**Given** a Kanban Board rendered
**When** a keyboard user focuses a card
**Then** card can be moved with keyboard
**And** column navigation is possible
**And** screen reader announces card position

### 3.4 Status Stepper Component

#### AC-022: Status Stepper Basic Rendering

**Given** a Status Stepper with defined steps
**When** the component renders
**Then** all steps are displayed
**And** current step is highlighted
**And** completed steps show checkmark
**And** pending steps are muted

#### AC-023: Status Stepper States

**Given** a Status Stepper step
**When** step state is "completed"
**Then** step shows checkmark icon
**When** step state is "active"
**Then** step shows loading or current indicator
**When** step state is "error"
**Then** step shows error icon
**When** step state is "pending"
**Then** step shows number

#### AC-024: Status Stepper Layouts

**Given** a Status Stepper with horizontal layout
**When** the component renders
**Then** steps are arranged horizontally
**And** connector lines are horizontal

**Given** a Status Stepper with vertical layout
**When** the component renders
**Then** steps are arranged vertically
**And** connector lines are vertical

### 3.5 BOM Tree View Component

#### AC-025: BOM Tree Part Display

**Given** a BOM Tree with product structure
**When** the component renders
**Then** part numbers are displayed
**And** quantities are shown for each part
**And** part images/icons are visible (optional)
**And** hierarchy is clear

#### AC-026: BOM Tree Version Comparison

**Given** a BOM Tree with two versions selected
**When** comparison mode is activated
**Then** differences are highlighted
**And** added parts show in green
**And** removed parts show in red
**And** modified parts show in yellow

#### AC-027: BOM Tree Export

**Given** a BOM Tree with data
**When** user clicks Export PDF
**Then** PDF is generated with tree structure
**When** user clicks Export Excel
**Then** Excel file is generated with parts list

### 3.6 Gantt Chart Component

#### AC-028: Gantt Chart Basic Rendering

**Given** a Gantt Chart with tasks
**When** the component renders
**Then** timeline header shows dates
**And** task bars are rendered at correct positions
**And** task names are visible
**And** today line is displayed

#### AC-029: Gantt Chart Task Dependencies

**Given** a Gantt Chart with dependent tasks
**When** the component renders
**Then** dependency arrows connect tasks
**And** arrow direction shows dependency direction
**And** critical path is highlighted (optional)

#### AC-030: Gantt Chart Zoom

**Given** a Gantt Chart with zoom controls
**When** user clicks Day view
**Then** timeline shows days
**When** user clicks Week view
**Then** timeline shows weeks
**When** user clicks Month view
**Then** timeline shows months

#### AC-031: Gantt Chart Interaction

**Given** a Gantt Chart task bar
**When** user hovers over task
**Then** tooltip shows task details
**When** user clicks task
**Then** task details panel opens
**When** user drags task edge
**Then** task duration changes

### 3.7 Version Timeline Component

#### AC-032: Version Timeline Basic Rendering

**Given** a Version Timeline with version history
**When** the component renders
**Then** versions are displayed chronologically
**And** version numbers are visible
**And** timestamps are formatted
**And** author information is shown

#### AC-033: Version Timeline Comparison

**Given** two versions selected in timeline
**When** user clicks Compare
**Then** diff view is displayed
**And** changes are highlighted
**And** added content shows in green
**And** removed content shows in red

### 3.8 Approval Diagram Component

#### AC-034: Approval Diagram Basic Rendering

**Given** an Approval Diagram with stages
**When** the component renders
**Then** all stages are displayed
**And** stage status is visible
**And** approvers are shown with avatars
**And** flow direction is clear

#### AC-035: Approval Diagram Status

**Given** an approval stage
**When** stage is pending
**Then** stage shows pending indicator
**When** stage is approved
**Then** stage shows approved checkmark
**When** stage is rejected
**Then** stage shows rejection with reason

### 3.9 CAD Previewer Component

#### AC-036: CAD Previewer Basic Rendering

**Given** a CAD file is loaded
**When** the previewer renders
**Then** 2D preview is displayed
**And** file metadata is shown
**And** loading state is handled

#### AC-037: CAD Previewer Controls

**Given** a CAD preview with controls
**When** user clicks zoom in
**Then** preview zooms in
**When** user clicks zoom out
**Then** preview zooms out
**When** user clicks reset
**Then** preview resets to default view

---

## 4. Pencil MCP Integration

### AC-038: Design File to Component Generation

**Given** a .pen design file in `.design/primitives/`
**When** generation script runs
**Then** corresponding component is created in `src/components/generated/`
**And** component includes TypeScript types
**And** component includes CVA variants
**And** component uses design tokens

### AC-039: Protected Regions in Generated Code

**Given** a generated component with protected regions
**When** code is regenerated
**Then** content outside protected regions is overwritten
**And** content inside protected regions is preserved
**And** manual customizations are maintained

### AC-040: Watch Mode Development

**Given** development watch mode is active
**When** a .pen file is modified
**Then** component is regenerated
**And** changes are reflected in running application
**And** no manual intervention required

---

## 5. Accessibility Compliance

### AC-041: WCAG 2.1 Level AA Compliance

**Given** any design system component
**When** accessibility audit is performed
**Then** no WCAG 2.1 Level AA violations exist
**And** color contrast ratio >= 4.5:1 for text
**And** all images have alt text
**And** all forms have labels

### AC-042: Keyboard Navigation

**Given** any interactive component
**When** user navigates with keyboard
**Then** Tab moves focus forward
**And** Shift+Tab moves focus backward
**And** Enter/Space activates controls
**And** Escape closes modals/dropdowns

### AC-043: Screen Reader Support

**Given** a screen reader is active
**When** user navigates design system components
**Then** all content is announced
**And** landmarks are correctly identified
**And** headings structure is logical
**And** live regions announce dynamic changes

---

## 6. Performance

### AC-044: Initial Bundle Size

**Given** the design system is integrated
**When** production build is analyzed
**Then** bundle size increase < 50KB gzipped
**And** tree-shaking removes unused components
**And** code splitting is applied per component

### AC-045: Component Render Performance

**Given** any design system component
**When** rendered with standard props
**Then** initial render completes within 100ms
**And** re-render on prop change completes within 16ms
**And** no layout thrashing occurs

### AC-046: Large Data Handling

**Given** Data Grid with 1000+ rows
**When** component renders
**Then** virtualization is applied
**And** scroll performance is smooth
**And** memory usage is controlled

---

## 7. Testing Requirements

### AC-047: Unit Test Coverage

**Given** all design system components
**When** test coverage is calculated
**Then** overall coverage >= 85%
**And** all variants are tested
**And** all states are tested
**And** edge cases are covered

### AC-048: Visual Regression Testing

**Given** visual regression test suite
**When** tests are executed
**Then** all components have baseline snapshots
**And** visual changes are detected
**And** approved changes update baselines

### AC-049: Accessibility Testing Automation

**Given** automated accessibility tests
**When** CI pipeline runs
**Then** axe-core tests execute
**And** WCAG violations fail the build
**And** accessibility report is generated

---

## 8. Documentation

### AC-050: Storybook Documentation

**Given** all design system components
**When** Storybook is accessed
**Then** each component has stories
**And** all variants are documented
**And** accessibility panel is available
**And** source code is viewable

### AC-051: Component API Documentation

**Given** any design system component
**When** developer views documentation
**Then** all props are listed with types
**And** default values are shown
**And** usage examples are provided
**And** accessibility notes are included

---

## 9. Quality Gates

### Definition of Done Checklist

| Criterion                        | Status |
|----------------------------------|--------|
| All acceptance criteria passed   | [ ]    |
| Unit test coverage >= 85%        | [ ]    |
| No WCAG 2.1 AA violations        | [ ]    |
| No TypeScript errors             | [ ]    |
| No ESLint errors                 | [ ]    |
| Bundle size within budget        | [ ]    |
| Storybook stories created        | [ ]    |
| Code review approved             | [ ]    |
| Documentation updated            | [ ]    |

### Exit Criteria for SPEC

| Criterion                        | Target           |
|----------------------------------|------------------|
| All phases complete              | 5/5 phases       |
| All PLM components delivered     | 10+ components   |
| Design token coverage            | 100%             |
| WCAG 2.1 AA compliance           | 100%             |
| Performance targets met          | All pass         |
| Documentation complete           | Storybook + API  |

---

## 10. Test Execution Plan

### Phase 1 Testing (Week 2)

- [ ] Token system unit tests
- [ ] Theme switching E2E tests
- [ ] Token integration verification

### Phase 2 Testing (Week 3)

- [ ] Base component token tests
- [ ] Accessibility audit on updated components
- [ ] Visual regression baseline

### Phase 3 Testing (Week 5)

- [ ] Data Grid comprehensive tests
- [ ] Tree View comprehensive tests
- [ ] Kanban Board comprehensive tests
- [ ] Status Stepper tests
- [ ] Keyboard navigation tests

### Phase 4 Testing (Week 7)

- [ ] BOM Tree tests
- [ ] Gantt Chart tests
- [ ] Version Timeline tests
- [ ] Approval Diagram tests
- [ ] CAD Previewer tests

### Phase 5 Testing (Week 8)

- [ ] Code generation integration tests
- [ ] Watch mode E2E tests
- [ ] Full accessibility audit
- [ ] Performance benchmarks
- [ ] Documentation completeness check
