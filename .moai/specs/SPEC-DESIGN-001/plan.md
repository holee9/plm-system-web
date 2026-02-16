# Implementation Plan: Pencil MCP-based Design System

## Metadata

| Field        | Value                                        |
|--------------|----------------------------------------------|
| SPEC ID      | SPEC-DESIGN-001                              |
| Created      | 2026-02-16                                   |
| Status       | Planned                                      |
| Timeline     | 8 weeks (5 phases)                           |

---

## 1. Overview

This plan outlines the implementation strategy for creating a comprehensive Pencil MCP-based Design System for PLM System Web. The implementation follows a phased approach, progressing from foundation work to advanced automation.

### 1.1 Primary Goals

1. Establish design token infrastructure with single source of truth
2. Extend existing shadcn/ui components with PLM design tokens
3. Build 10+ PLM-specific components for domain needs
4. Create Pencil MCP to code generation pipeline
5. Ensure WCAG 2.1 AA accessibility compliance

### 1.2 Secondary Goals

1. Storybook documentation for all components
2. Automated accessibility testing in CI/CD
3. Theme customization capabilities
4. Performance optimization for bundle size

---

## 2. Implementation Roadmap

### Phase 1: Foundation & Tokens (Week 1-2)

**Priority: High | Dependencies: None**

#### 1.1 Design Token Infrastructure

**Tasks:**
- [ ] Refactor `design-tokens.json` to support semantic and component tokens
- [ ] Create token generation script for CSS custom properties
- [ ] Update `tailwind.config.ts` to consume design tokens
- [ ] Create `src/lib/design-tokens.ts` TypeScript exports
- [ ] Implement theme switching mechanism (light/dark)

**Deliverables:**
```
src/lib/design-tokens.ts      # TypeScript token exports
src/styles/tokens.css         # CSS custom properties
src/styles/themes/light.css   # Light theme overrides
src/styles/themes/dark.css    # Dark theme overrides
tailwind.config.ts            # Updated with token references
```

**Files to Modify:**
- `D:\workspace-github\plm-system-web\src\lib\design-tokens.ts`
- `D:\workspace-github\plm-system-web\src\design\design-tokens.json`
- `D:\workspace-github\plm-system-web\tailwind.config.ts`

#### 1.2 .design/ Directory Setup

**Tasks:**
- [ ] Create `.design/` directory structure
- [ ] Migrate existing .pen files from `src/design/` to `.design/`
- [ ] Create token subdirectories (colors, typography, spacing)
- [ ] Document Pencil MCP design guidelines

**Deliverables:**
```
.design/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── primitives/
└── patterns/
```

#### 1.3 Component Architecture

**Tasks:**
- [ ] Create `src/components/generated/` directory
- [ ] Create `src/components/plm/` directory
- [ ] Define component template structure
- [ ] Set up CVA (Class Variance Authority) integration

**Deliverables:**
```
src/components/
├── ui/           # Existing shadcn/ui
├── generated/    # Auto-generated from .pen
│   ├── primitives/
│   └── patterns/
└── plm/          # PLM-specific components
```

---

### Phase 2: Base Components Extended (Week 3)

**Priority: High | Dependencies: Phase 1**

#### 2.1 Token Integration for Existing Components

**Tasks:**
- [ ] Audit all 21 existing shadcn/ui components
- [ ] Replace hardcoded values with design token references
- [ ] Add CVA variants for common modifications
- [ ] Create component-level token overrides where needed

**Components to Update:**
| Component  | Token Updates              | Variants to Add        |
|------------|---------------------------|------------------------|
| Button     | Colors, spacing, radius   | size, variant, state   |
| Input      | Border, background, focus | size, state, error     |
| Card       | Background, shadow, border| variant, padding       |
| Badge      | Colors (semantic)         | variant, size          |
| Table      | Header, row, border       | variant, density       |
| Dialog     | Overlay, panel, shadow    | size, variant          |

#### 2.2 Accessibility Audit

**Tasks:**
- [ ] Run axe-core accessibility audit on all components
- [ ] Fix WCAG 2.1 AA violations
- [ ] Add ARIA attributes where missing
- [ ] Ensure keyboard navigation for all interactive components

**Deliverables:**
- Accessibility compliance report
- Fixed component implementations
- Keyboard navigation documentation

---

### Phase 3: PLM Components MVP (Week 4-5)

**Priority: High | Dependencies: Phase 2**

#### 3.1 Data Grid Component

**Complexity: High | Priority: High**

**Tasks:**
- [ ] Design Data Grid structure in Pencil (.pen file)
- [ ] Implement core Data Grid with sorting/filtering
- [ ] Add pagination support
- [ ] Implement row selection (single/multi)
- [ ] Add responsive behavior for mobile

**Files to Create:**
```
src/components/plm/data-grid/
├── index.ts
├── DataGrid.tsx
├── DataGrid.types.ts
├── DataGrid.variants.ts
├── DataGrid.test.tsx
├── DataGrid.stories.tsx
└── columns/
    ├── DataGridColumn.tsx
    └── DataGridColumnHeader.tsx
```

#### 3.2 Tree View Component

**Complexity: Medium | Priority: High**

**Tasks:**
- [ ] Design Tree View structure in Pencil
- [ ] Implement expandable/collapsible nodes
- [ ] Add selection support
- [ ] Implement lazy loading for large trees
- [ ] Add keyboard navigation

**Files to Create:**
```
src/components/plm/tree-view/
├── index.ts
├── TreeView.tsx
├── TreeNode.tsx
├── TreeView.types.ts
├── TreeView.variants.ts
├── TreeView.test.tsx
└── TreeView.stories.tsx
```

#### 3.3 Kanban Board Component

**Complexity: High | Priority: High**

**Tasks:**
- [ ] Design Kanban Board in Pencil
- [ ] Implement drag-and-drop with dnd-kit
- [ ] Create column and card components
- [ ] Add WIP (Work In Progress) limits
- [ ] Implement smooth animations

**Files to Create:**
```
src/components/plm/kanban-board/
├── index.ts
├── KanbanBoard.tsx
├── KanbanColumn.tsx
├── KanbanCard.tsx
├── KanbanBoard.types.ts
├── KanbanBoard.variants.ts
├── KanbanBoard.test.tsx
└── KanbanBoard.stories.tsx
```

#### 3.4 Status Stepper Component

**Complexity: Low | Priority: Medium**

**Tasks:**
- [ ] Design Status Stepper in Pencil
- [ ] Implement horizontal and vertical layouts
- [ ] Add step states (completed, active, pending, error)
- [ ] Create connector line variations

**Files to Create:**
```
src/components/plm/status-stepper/
├── index.ts
├── StatusStepper.tsx
├── StatusStep.tsx
├── StatusStepper.types.ts
├── StatusStepper.variants.ts
├── StatusStepper.test.tsx
└── StatusStepper.stories.tsx
```

---

### Phase 4: Advanced Components (Week 6-7)

**Priority: Medium | Dependencies: Phase 3**

#### 4.1 BOM Tree View Component

**Complexity: High | Priority: High**

**Tasks:**
- [ ] Design BOM Tree structure in Pencil
- [ ] Extend Tree View for BOM-specific needs
- [ ] Add part number and quantity display
- [ ] Implement version comparison view
- [ ] Add export functionality (PDF, Excel)

**Files to Create:**
```
src/components/plm/bom-tree/
├── index.ts
├── BomTree.tsx
├── BomTreeNode.tsx
├── BomTree.types.ts
├── BomTreeToolbar.tsx
├── BomTree.test.tsx
└── BomTree.stories.tsx
```

#### 4.2 Gantt Chart Component

**Complexity: High | Priority: Medium**

**Tasks:**
- [ ] Design Gantt Chart in Pencil
- [ ] Implement timeline visualization
- [ ] Add task dependencies (arrows)
- [ ] Create zoom controls (day/week/month)
- [ ] Implement drag-to-resize functionality

**Files to Create:**
```
src/components/plm/gantt-chart/
├── index.ts
├── GanttChart.tsx
├── GanttTask.tsx
├── GanttTimeline.tsx
├── GanttChart.types.ts
├── GanttChart.test.tsx
└── GanttChart.stories.tsx
```

#### 4.3 Version Timeline Component

**Complexity: Medium | Priority: Medium**

**Tasks:**
- [ ] Design Version Timeline in Pencil
- [ ] Implement vertical timeline layout
- [ ] Add version comparison UI
- [ ] Create change diff visualization

**Files to Create:**
```
src/components/plm/version-timeline/
├── index.ts
├── VersionTimeline.tsx
├── VersionNode.tsx
├── VersionTimeline.types.ts
├── VersionTimeline.test.tsx
└── VersionTimeline.stories.tsx
```

#### 4.4 Approval Diagram Component

**Complexity: Medium | Priority: Medium**

**Tasks:**
- [ ] Design Approval Diagram in Pencil
- [ ] Implement multi-stage approval flow
- [ ] Add approver avatars and status
- [ ] Create connection lines between stages

**Files to Create:**
```
src/components/plm/approval-diagram/
├── index.ts
├── ApprovalDiagram.tsx
├── ApprovalStage.tsx
├── ApprovalDiagram.types.ts
├── ApprovalDiagram.test.tsx
└── ApprovalDiagram.stories.tsx
```

#### 4.5 CAD Previewer Component

**Complexity: High | Priority: Low (MVP)**

**Tasks:**
- [ ] Design CAD Previewer UI in Pencil
- [ ] Research open-source CAD viewers
- [ ] Implement basic file upload and preview
- [ ] Add zoom/pan/rotate controls
- [ ] Create placeholder for future 3D viewer

**Files to Create:**
```
src/components/plm/cad-previewer/
├── index.ts
├── CadPreviewer.tsx
├── CadPreviewer.types.ts
├── CadPreviewerControls.tsx
├── CadPreviewer.test.tsx
└── CadPreviewer.stories.tsx
```

---

### Phase 5: Automation Pipeline (Week 8)

**Priority: Medium | Dependencies: Phase 4**

#### 5.1 Pencil MCP CLI Integration

**Tasks:**
- [ ] Research Pencil MCP export capabilities
- [ ] Create .pen to React component parser
- [ ] Implement protected region detection
- [ ] Build code generation templates
- [ ] Create watch mode for development

**Deliverables:**
```
scripts/
├── generate-components.ts    # Main generation script
├── parsers/
│   └── pen-parser.ts        # .pen file parser
├── templates/
│   ├── component.ts.hbs     # Component template
│   ├── types.ts.hbs         # Types template
│   └── variants.ts.hbs      # CVA variants template
└── watch.ts                  # Watch mode script
```

#### 5.2 Documentation Generation

**Tasks:**
- [ ] Set up Storybook 8.x
- [ ] Create component documentation templates
- [ ] Auto-generate stories from component props
- [ ] Add accessibility documentation tab
- [ ] Deploy Storybook to GitHub Pages

**Deliverables:**
- Storybook instance with all components
- Auto-generated documentation
- Accessibility testing panel

#### 5.3 Testing Infrastructure

**Tasks:**
- [ ] Set up Vitest for unit testing
- [ ] Configure Playwright for E2E testing
- [ ] Add axe-core for accessibility testing
- [ ] Create visual regression testing setup
- [ ] Integrate tests in CI/CD pipeline

**Deliverables:**
- Unit test coverage >80%
- E2E test suite for critical flows
- Accessibility test suite
- Visual regression baseline

---

## 3. Technical Approach

### 3.1 Component Development Pattern

Each component follows this development pattern:

```
1. Design Phase
   - Create .pen design file in .design/primitives/ or .design/patterns/
   - Define variants, states, and responsive behavior
   - Review with design team

2. Implementation Phase
   - Generate TypeScript types from design
   - Implement component with CVA variants
   - Add accessibility attributes
   - Write unit tests

3. Documentation Phase
   - Create Storybook stories
   - Document props and variants
   - Add usage examples

4. Integration Phase
   - Export from component index
   - Add to design system documentation
   - Update bundle size tracking
```

### 3.2 CVA (Class Variance Authority) Pattern

```typescript
// Component variants pattern
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### 3.3 Theme Switching Implementation

```typescript
// Theme provider pattern
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3.4 Protected Regions for Generated Code

```typescript
// Generated component with protected regions
// src/components/generated/primitives/Button.tsx

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      // PROTECTED REGION START - Do not modify generated variants
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
      // PROTECTED REGION END
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// PROTECTED REGION START - Custom implementations allowed
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Custom props can be added here
}
// PROTECTED REGION END

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## 4. Critical Files

### 4.1 Files to Create

| File Path                                        | Purpose                          |
|--------------------------------------------------|----------------------------------|
| `.design/tokens/colors.json`                     | Color token definitions          |
| `.design/tokens/typography.json`                 | Typography token definitions     |
| `.design/tokens/spacing.json`                    | Spacing token definitions        |
| `src/styles/tokens.css`                          | CSS custom properties            |
| `src/styles/themes/light.css`                    | Light theme overrides            |
| `src/styles/themes/dark.css`                     | Dark theme overrides             |
| `src/components/plm/data-grid/DataGrid.tsx`      | Data Grid component              |
| `src/components/plm/tree-view/TreeView.tsx`      | Tree View component              |
| `src/components/plm/kanban-board/KanbanBoard.tsx`| Kanban Board component           |
| `scripts/generate-components.ts`                 | Code generation script           |

### 4.2 Files to Modify

| File Path                                        | Changes                          |
|--------------------------------------------------|----------------------------------|
| `src/lib/design-tokens.ts`                       | Add semantic token layer         |
| `src/design/design-tokens.json`                  | Restructure for components       |
| `tailwind.config.ts`                             | Integrate design tokens          |
| `src/components/ui/button.tsx`                   | Add PLM token references         |
| `src/components/ui/input.tsx`                    | Add PLM token references         |
| `src/app/layout.tsx`                             | Add ThemeProvider                |

---

## 5. Verification Plan

### 5.1 Unit Testing Strategy

```bash
# Run unit tests for design system
pnpm test src/components/plm/

# Run with coverage
pnpm test:coverage src/components/plm/

# Target: 85% coverage for new components
```

### 5.2 Accessibility Testing

```bash
# Run axe-core accessibility tests
pnpm test:a11y

# Manual testing checklist
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast ratio >= 4.5:1
- [ ] Focus indicators visible
- [ ] Screen reader announces all content
- [ ] No WCAG 2.1 AA violations
```

### 5.3 Visual Regression Testing

```bash
# Run Playwright visual tests
pnpm test:visual

# Update baselines after approved changes
pnpm test:visual --update-snapshots
```

### 5.4 Bundle Size Monitoring

```bash
# Analyze bundle size
pnpm analyze

# Track bundle size changes
- Baseline: Current bundle size (before design system)
- Target: <50KB increase for design system
- Alert threshold: +10KB per component
```

---

## 6. Dependencies

### 6.1 NPM Packages Required

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@radix-ui/react-accordion": "^1.1.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0"
  },
  "devDependencies": {
    "@storybook/react": "^8.0.0",
    "@storybook/nextjs": "^8.0.0",
    "axe-core": "^4.8.0",
    "@axe-core/react": "^4.8.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### 6.2 External Dependencies

| Dependency          | Purpose                          | Version |
|---------------------|----------------------------------|---------|
| Pencil MCP          | Design file editing              | Latest  |
| Node.js             | Runtime environment              | 18+     |
| pnpm                | Package manager                  | 8+      |

---

## 7. Milestones

| Milestone | Phase | Target        | Deliverable                          |
|-----------|-------|---------------|--------------------------------------|
| M1        | 1     | End of Week 2 | Token infrastructure complete        |
| M2        | 2     | End of Week 3 | Base components updated              |
| M3        | 3     | End of Week 5 | PLM MVP components complete          |
| M4        | 4     | End of Week 7 | Advanced components complete         |
| M5        | 5     | End of Week 8 | Automation pipeline operational      |

---

## 8. Rollback Plan

### 8.1 Component Rollback

Each component is independently deployable. If issues arise:
1. Remove component export from index.ts
2. Revert to previous version in Git
3. Redeploy affected module only

### 8.2 Token Rollback

Design tokens are versioned:
1. Previous token versions stored in `.design/tokens/archive/`
2. CSS custom properties can be reverted via Git
3. Tailwind config changes are reversible

### 8.3 Full System Rollback

If design system causes critical issues:
1. Revert all commits in SPEC-DESIGN-001 branch
2. Deploy previous stable version
3. Investigate and fix issues in isolation
