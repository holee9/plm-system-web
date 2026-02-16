# SPEC-DESIGN-001: Pencil MCP-based Design System

## Metadata

| Field        | Value                                        |
|--------------|----------------------------------------------|
| SPEC ID      | SPEC-DESIGN-001                              |
| Title        | Pencil MCP-based Design System for PLM Web   |
| Created      | 2026-02-16                                   |
| Status       | Planned                                      |
| Priority     | High                                         |
| Assigned     | expert-frontend, team-designer               |
| Lifecycle    | spec-anchored                                |
| Related      | SPEC-UI-001 (Future), SPEC-THEME-001 (Future)|

---

## 1. Environment

### 1.1 Project Context

PLM System Web is a Product Lifecycle Management platform integrating project management with PLM capabilities. The design system serves as the foundation for all UI development across 7 domain modules: identity, project, issue, plm, document, notification, and reporting.

### 1.2 Technology Stack

| Layer         | Technology              | Version   |
|---------------|-------------------------|-----------|
| Framework     | Next.js                 | 15+       |
| UI Library    | React                   | 19+       |
| Language      | TypeScript              | 5.9+      |
| Styling       | Tailwind CSS            | 4+        |
| UI Components | shadcn/ui               | Latest    |
| Design Tool   | Pencil MCP              | Latest    |
| Variants      | CVA (Class Variance)    | Latest    |

### 1.3 Existing Assets

**Design Files (4 .pen files):**
- `src/design/dashboard.pen` - Dashboard layouts
- `src/design/issue-board.pen` - Issue board views
- `src/design/project-detail.pen` - Project detail pages
- `src/design/plm-dashboard.pen` - PLM dashboard

**Existing Components (21 shadcn/ui components):**
- Form: button, input, textarea, select, checkbox, radio-group, label, form
- Layout: card, tabs, dialog, sheet, table, badge, avatar, dropdown-menu
- Feedback: toast, toaster, loading-skeleton, page-transition
- Accessibility: skip-link

**Design Tokens:**
- `src/lib/design-tokens.ts` - TypeScript token definitions
- `src/design/design-tokens.json` - JSON token definitions (light/dark)

### 1.4 Target Users

| Persona              | Description                                  | Primary Need                    |
|----------------------|----------------------------------------------|---------------------------------|
| Product Developer    | Designers creating UI mockups                | Fast design-to-code workflow    |
| Project Manager      | Non-technical stakeholders                   | Consistent, professional UI     |
| QA Engineer          | Testing team members                         | Accessible, predictable UI      |
| System Administrator | DevOps and configuration                     | Theme customization             |
| UI/UX Designer       | Design system maintainers                    | Efficient component creation    |

---

## 2. Assumptions

### 2.1 Technical Assumptions

| Assumption                              | Confidence | Evidence                           |
|-----------------------------------------|------------|------------------------------------|
| Pencil MCP exports valid .pen format    | High       | Existing 4 .pen files in project   |
| shadcn/ui components are customizable   | High       | 21 components already integrated   |
| Tailwind CSS 4 supports all token types | High       | Official compatibility             |
| CVA handles variant styling efficiently | Medium     | Industry standard for variants     |

### 2.2 Business Assumptions

| Assumption                              | Confidence | Evidence                           |
|-----------------------------------------|------------|------------------------------------|
| 30+ components needed total             | Medium     | Analyst research findings          |
| 80% UI from design system achievable    | Medium     | Industry benchmarks                |
| 50% faster development achievable       | Medium     | Similar project case studies       |

### 2.3 Constraint Assumptions

| Assumption                              | Confidence | Evidence                           |
|-----------------------------------------|------------|------------------------------------|
| 8-week MVP timeline is feasible         | Medium     | Team capacity estimate             |
| WCAG 2.1 AA compliance required         | High       | Accessibility standards            |
| No breaking changes to existing UI      | High       | Production stability requirement   |

---

## 3. Requirements

### 3.1 WHOLE System Requirements (Ubiquitous)

The design system **shall always** maintain consistency across all PLM System Web modules.

The design system **shall always** support light and dark theme modes.

The design system **shall always** comply with WCAG 2.1 Level AA accessibility standards.

The design system **shall always** provide TypeScript type definitions for all components.

The design system **shall always** use design tokens as the single source of truth for styling values.

The design system **shall always** maintain backward compatibility with existing shadcn/ui components.

### 3.2 WHEN Event-Driven Requirements

**WHEN** a designer creates a .pen file in the `.design/` directory, **THEN** the system **shall** generate corresponding React component code in `src/components/generated/`.

**WHEN** design tokens are updated in `design-tokens.json`, **THEN** the system **shall** propagate changes to all consuming components within the same build cycle.

**WHEN** a new component variant is added, **THEN** the system **shall** automatically generate CVA variant definitions.

**WHEN** a user toggles theme mode, **THEN** all components **shall** transition smoothly using CSS custom properties.

**WHEN** a component is used in any of the 7 domain modules, **THEN** it **shall** maintain consistent visual appearance and behavior.

### 3.3 IF State-Driven Requirements

**IF** a component requires responsive behavior, **THEN** it **shall** use Tailwind CSS responsive prefixes with mobile-first approach.

**IF** a component has multiple visual variants, **THEN** it **shall** use CVA (Class Variance Authority) for variant management.

**IF** a component requires state management (loading, error, disabled), **THEN** it **shall** expose these as props with sensible defaults.

**IF** a component renders user content, **THEN** it **shall** sanitize input to prevent XSS vulnerabilities.

**IF** a designer modifies an existing .pen file, **THEN** the system **shall** preserve manual overrides in generated code through protected regions.

### 3.4 WHERE Optional Requirements

**WHERE** possible, provide Storybook stories for visual documentation.

**WHERE** possible, generate unit test scaffolds for new components.

**WHERE** possible, provide Figma import compatibility for external design tools.

**WHERE** possible, support RTL (Right-to-Left) language layouts.

### 3.5 Unwanted Behavior Requirements

The system **shall not** break existing production UI during design system updates.

The system **shall not** generate code that bypasses TypeScript type checking.

The system **shall not** use inline styles when design tokens are available.

The system **shall not** create components with color contrast ratios below WCAG AA standards.

The system **shall not** duplicate existing shadcn/ui functionality without explicit justification.

---

## 4. Specifications

### 4.1 Design System Architecture

```
Design System Architecture
├── .design/                      # Original design files (Pencil MCP)
│   ├── tokens/                   # Design token definitions
│   │   ├── colors.json
│   │   ├── typography.json
│   │   └── spacing.json
│   ├── primitives/               # Basic building blocks
│   │   ├── button.pen
│   │   ├── input.pen
│   │   └── icon.pen
│   └── patterns/                 # Composite patterns
│       ├── forms.pen
│       ├── cards.pen
│       └── navigation.pen
│
├── src/
│   ├── lib/
│   │   ├── design-tokens.ts      # TypeScript token exports
│   │   └── cn.ts                 # Class name utility
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base (existing)
│   │   ├── generated/            # Auto-generated from .pen
│   │   │   ├── primitives/
│   │   │   └── patterns/
│   │   └── plm/                  # PLM-specific components
│   │       ├── data-grid/
│   │       ├── tree-view/
│   │       ├── kanban-board/
│   │       ├── bom-tree/
│   │       ├── gantt-chart/
│   │       ├── status-stepper/
│   │       ├── approval-diagram/
│   │       ├── version-timeline/
│   │       └── cad-previewer/
│   │
│   └── styles/
│       ├── tokens.css            # CSS custom properties
│       └── themes/
│           ├── light.css
│           └── dark.css
│
└── tailwind.config.ts            # Tailwind + token integration
```

### 4.2 Component Library Structure

#### 4.2.1 Base Components (Existing - 21)

Maintained from shadcn/ui, extended with PLM design tokens:
- Button, Input, Textarea, Select, Checkbox, Radio, Label, Form
- Card, Tabs, Dialog, Sheet, Table, Badge, Avatar, Dropdown
- Toast, Toaster, Loading-Skeleton, Page-Transition, Skip-Link

#### 4.2.2 New PLM Components (10+)

| Component          | Purpose                          | Complexity |
|--------------------|----------------------------------|------------|
| Data Grid          | Tabular data with sorting/filter | High       |
| Tree View          | Hierarchical navigation          | Medium     |
| Kanban Board       | Drag-and-drop issue tracking     | High       |
| BOM Tree View      | Product structure visualization  | High       |
| Gantt Chart        | Project timeline display         | High       |
| Status Stepper     | Workflow progress indicator      | Low        |
| Approval Diagram   | Multi-stage approval flow        | Medium     |
| Version Timeline   | Version history visualization    | Medium     |
| CAD Previewer      | CAD file viewer integration      | High       |
| Command Palette    | Keyboard navigation              | Medium     |

### 4.3 Design Token System

```typescript
// Token hierarchy
interface DesignTokenSystem {
  // Semantic tokens (reference primitive tokens)
  semantic: {
    background: TokenCategory;
    foreground: TokenCategory;
    border: TokenCategory;
    accent: TokenCategory;
  };

  // Component tokens (reference semantic tokens)
  components: {
    button: ComponentTokens;
    input: ComponentTokens;
    card: ComponentTokens;
    // ... per component
  };

  // Domain tokens (PLM-specific)
  domains: {
    project: DomainTokens;
    issue: DomainTokens;
    plm: DomainTokens;
  };
}
```

### 4.4 Pencil MCP Integration Workflow

```
Phase 1: Manual (Weeks 1-2)
┌─────────────┐    Manual     ┌──────────────┐
│  .pen file  │ ────────────> │ Code Review  │
└─────────────┘               └──────────────┘
                                     │
                                     v
                              ┌──────────────┐
                              │  Component   │
                              │  Implementation │
                              └──────────────┘

Phase 2: Semi-Automated (Weeks 3-4)
┌─────────────┐    Pencil     ┌──────────────┐    Manual     ┌──────────────┐
│  .pen file  │ ────────────> │   Export     │ ────────────> │ Code Review  │
└─────────────┘     MCP       └──────────────┘               └──────────────┘
                                                                │
                                                                v
                                                         ┌──────────────┐
                                                         │  Refinement  │
                                                         └──────────────┘

Phase 3: Automated (Weeks 5-8)
┌─────────────┐    Pencil     ┌──────────────┐    Auto      ┌──────────────┐
│  .pen file  │ ────────────> │   Export     │ ──────────>  │  Generated   │
└─────────────┘     MCP       │   + CLI      │              │  Component   │
                               └──────────────┘              └──────────────┘
                                     │                              │
                                     v                              v
                              ┌──────────────┐              ┌──────────────┐
                              │  Protected   │              │   Type       │
                              │  Regions     │              │   Checking   │
                              └──────────────┘              └──────────────┘
```

### 4.5 File Organization

```
Generated Component Structure
src/components/plm/data-grid/
├── index.ts                    # Public exports
├── DataGrid.tsx               # Main component
├── DataGrid.types.ts          # TypeScript definitions
├── DataGrid.variants.ts       # CVA variant definitions
├── DataGrid.test.tsx          # Unit tests
├── DataGrid.stories.tsx       # Storybook stories
└── DataGrid.module.css        # Scoped styles (if needed)
```

---

## 5. Traceability

### 5.1 TAG Block

```
TAG: SPEC-DESIGN-001
TYPE: Feature
DOMAIN: frontend, design-system
SCOPE: components, tokens, workflow
DEPENDENCIES:
  - shadcn/ui (existing)
  - Tailwind CSS 4
  - Pencil MCP
  - CVA (class-variance-authority)
BLOCKS: None
REFERENCES:
  - .moai/project/product.md (Section 3: Design Management Module)
  - .moai/project/tech.md (Frontend Stack)
```

### 5.2 Implementation Tracking

| Phase | Description              | Components        | Status    |
|-------|--------------------------|-------------------|-----------|
| 1     | Foundation & Tokens      | Tokens, Theme     | Planned   |
| 2     | Base Components Extended | 21 shadcn/ui      | Planned   |
| 3     | PLM Components MVP       | Data Grid, Tree   | Planned   |
| 4     | Advanced Components      | Gantt, CAD        | Planned   |
| 5     | Automation Pipeline      | Pencil MCP CLI    | Planned   |

---

## 6. Constraints

### 6.1 Technical Constraints

- C-001: Must not increase initial bundle size by more than 50KB gzipped
- C-002: All components must render within 100ms on standard devices
- C-003: Design token changes must not require application restart
- C-004: Generated code must pass TypeScript strict mode
- C-005: Components must work without JavaScript for initial render (SSR)

### 6.2 Business Constraints

- C-006: MVP delivery within 8 weeks
- C-007: No disruption to existing production features
- C-008: Zero cost for external design tools (open-source only)
- C-009: Design team must not require coding knowledge for basic usage

### 6.3 Compliance Constraints

- C-010: WCAG 2.1 Level AA compliance mandatory
- C-011: Color contrast ratio minimum 4.5:1 for text
- C-012: All interactive elements keyboard accessible
- C-013: Screen reader support for all components

---

## 7. Risks and Mitigation

| Risk                               | Likelihood | Impact | Mitigation                              |
|------------------------------------|------------|--------|-----------------------------------------|
| Pencil export format mismatch      | Medium     | High   | Manual wrapper components for shadcn/ui |
| Complex component generation       | Medium     | Medium | Generate UI-only, keep logic manual     |
| Token synchronization drift        | Low        | High   | Single source of truth in JSON          |
| Bundle size bloat                  | Medium     | Medium | Tree-shaking, lazy loading              |
| Accessibility gaps                 | Medium     | High   | Automated a11y testing in CI            |
| Team adoption resistance           | Low        | Medium | Training, documentation, gradual rollout|

---

## 8. Success Criteria

| Criterion                          | Target      | Measurement                    |
|------------------------------------|-------------|--------------------------------|
| Design token coverage              | 100%        | All hardcoded values replaced  |
| Component library size             | 30+         | Component count                |
| Development velocity improvement   | 50%         | Feature delivery time          |
| UI consistency score               | 80%         | Design review audit            |
| WCAG 2.1 AA compliance             | 100%        | Automated a11y tests           |
| Bundle size increase               | <50KB       | Build analysis                 |
| Designer satisfaction              | 4.0/5.0     | User survey                    |
| Code generation accuracy           | 90%         | Manual review acceptance rate  |

---

## 9. Acceptance Criteria Reference

Detailed acceptance criteria are defined in `acceptance.md` with Given-When-Then format test scenarios for each requirement.

---

## 10. Implementation Plan Reference

Detailed implementation roadmap with milestones is defined in `plan.md` covering the 8-week, 5-phase delivery schedule.
