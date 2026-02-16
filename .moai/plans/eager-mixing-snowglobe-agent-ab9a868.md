# Plan: Pencil MCP Design System for PLM System Web

## Analysis Overview

### Existing Assets
- **Framework**: Next.js 15 with TypeScript, React 19, App Router
- **UI Library**: Radix UI primitives with Tailwind CSS styling
- **Component Base**: 20+ shadcn/ui components (Button, Card, Dialog, Form, Table, etc.)
- **Design Tokens**: Established in `design-tokens.ts` and `globals.css`
- **Theme System**: Dark mode support with CSS variables
- **Icons**: Lucide React
- **Modules**: 5 core modules (Project Management, PLM, Design, AI Automation, Integration)

## User Personas & Stories

### Persona 1: Product Developer (Engineer/Designer)
**Goals**:
- Create and manage product designs efficiently
- Track BOM changes and CAD file versions
- Collaborate with team on design reviews

**User Stories**:
1. As a product developer, I want to visually design product structures using Pencil, so that I can prototype BOM hierarchies before implementation
2. As a product developer, I want drag-and-drop component assembly, so that I can quickly build product configurations
3. As a product developer, I want real-time design preview, so that I can validate changes before committing

### Persona 2: Project Manager
**Goals**:
- Track project progress across all modules
- Manage sprint backlogs and Gantt charts
- Monitor team capacity and workload

**User Stories**:
1. As a project manager, I want customizable dashboard widgets, so that I can focus on relevant metrics
2. As a project manager, I want visual project timeline views, so that I can identify bottlenecks
3. As a project manager, I want drag-and-drop task prioritization, so that I can adjust sprint scope dynamically

### Persona 3: QA Engineer
**Goals**:
- Track defects and test cases
- Link issues to BOM components
- Monitor quality metrics

**User Stories**:
1. As a QA engineer, I want visual issue boards with status indicators, so that I can quickly assess testing progress
2. As a QA engineer, I want color-coded priority badges, so that I can identify critical issues
3. As a QA engineer, I want test case templates, so that I can standardize testing documentation

### Persona 4: System Administrator
**Goals**:
- Configure system settings
- Manage user permissions
- Monitor system health

**User Stories**:
1. As an administrator, I want clear settings navigation, so that I can find configuration options quickly
2. As an administrator, I want visual permission matrices, so that I can audit access control
3. As an administrator, I want system health dashboards, so that I can monitor performance

### Persona 5: UI/UX Designer (using Pencil MCP)
**Goals**:
- Create consistent UI prototypes
- Maintain design system compliance
- Export designs to code

**User Stories**:
1. As a designer, I want Pencil canvas with pre-loaded design tokens, so that my designs match the implementation
2. As a designer, I want component library access in Pencil, so that I can use existing UI elements
3. As a designer, I want design-to-code export, so that I can generate React components from Pencil designs

## Design System Requirements

### 1. Design Tokens (Enhanced)

**Existing**: Basic spacing, radius, typography, z-index, duration, easing, breakpoints

**Needed Additions**:
- **Color System Expansion**:
  - Semantic color palettes for each module (Project, PLM, Issues, etc.)
  - Status colors (expanded beyond current issue/priority)
  - Data visualization colors (charts, graphs)
  - Alert/notification levels (info, warning, error, success)

- **Typography Scale**:
  - Heading hierarchy (h1-h6) with specific use cases
  - Body text variants (regular, medium, semibold for emphasis)
  - Code/monospace variants for technical content
  - Caption/overline for metadata

- **Spacing System**:
  - Component-specific spacing (cards, buttons, inputs)
  - Layout spacing (margins, padding for containers)
  - Grid gap tokens for consistent layouts

- **Shadows**:
  - Elevation levels (flat, raised, floating, modal)
  - Hover shadows for interactive elements
  - Focus ring variants

- **Border System**:
  - Width tokens (hairline, thin, medium, thick)
  - Style tokens (solid, dashed, dotted)
  - Radius variants (pill, rounded, square)

### 2. Component Library Requirements

**Existing Components** (from shadcn/ui):
- Button, Input, Textarea, Select, Checkbox, Radio Group
- Card, Dialog, Sheet, Dropdown Menu, Tabs
- Table, Badge, Avatar, Toast, Form

**Needed Components**:

**A. Data Display**
- Data Grid (sortable, filterable, virtual scrolling)
- Tree View (for BOM hierarchies)
- Timeline/Gantt Chart
- Calendar/Date Picker
- Kanban Board (draggable columns)
- Status Stepper
- Progress/Activity Timeline

**B. Navigation**
- Breadcrumb (hierarchical navigation)
- Pagination (with page size selector)
- Tab Bar (bottom navigation for mobile)
- Command Palette (Cmd+K search)

**C. Feedback**
- Alert Banner (dismissible notifications)
- Skeleton Loader (for async content)
- Empty State (illustration + action)
- Error Boundary UI
- Loading Overlay

**D. Layout**
- Dashboard Grid (resizable widgets)
- Split Pane (resizable panels)
- Stack (flexible vertical layout)
- Cluster (flexible horizontal layout)
- Container (max-width with responsive padding)

**E. Forms**
- File Upload (drag-drop zone)
- Rich Text Editor
- Multi-Select (with chips)
- Date Range Picker
- Color Picker
- Slider/Range Input

**F. Specialized PLM Components**
- BOM Tree View (nested, collapsible)
- CAD File Previewer
- Approval Workflow Diagram
- Version History Timeline
- Change Request Diff Viewer

### 3. Layout Patterns

**A. App Shell Structure**
- Top Navigation Bar (logo, search, user menu, theme toggle)
- Sidebar Navigation (collapsible, module-based)
- Main Content Area (with scroll)
- Optional: Right Panel (details, activity feed)

**B. Dashboard Layouts**
- Widget Grid (responsive, masonry-style)
- Stats Row (summary cards)
- Chart Section (data visualization)
- Activity Feed (recent events)

**C. Detail Pages**
- Header (title, actions, breadcrumbs)
- Tab Navigation (overview, details, activity)
- Content Sections (grouped information)
- Sidebar (metadata, related items)

**D. Modal/Dialog Patterns**
- Form Dialogs (centered, focused)
- Sheet/Drawer (side panel for details)
- Full Screen Modal (for complex workflows)

### 4. Responsive Design

**Breakpoints** (existing, need documentation):
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px - 1280px
- Wide: > 1280px

**Patterns**:
- Mobile-first approach
- Collapsible sidebar on mobile
- Horizontal scrolling for tables
- Bottom navigation for mobile apps
- Touch-friendly tap targets (44px minimum)

### 5. Pencil MCP Integration

**Designer Workflow**:
1. Open Pencil canvas with PLM design system template
2. Access component library panel (pre-built UI elements)
3. Drag components to canvas and configure properties
4. Apply design tokens from token panel
5. Preview in light/dark mode
6. Export to React code (TypeScript, Tailwind)

**Technical Integration**:
- Design token synchronization between Pencil and codebase
- Component library export/import for Pencil
- Custom property panels for PLM-specific components
- Design version control integration
- Hand-off documentation generation

## MVP Feature Prioritization

### Phase 1: Foundation (Week 1-2) - MUST HAVE
1. Enhanced design tokens (colors, typography, spacing, shadows)
2. Core component variants (expanded button, input, card styles)
3. App shell layout (sidebar, navbar, content area)
4. Theme system validation (light/dark mode)
5. Pencil canvas template with basic design tokens

### Phase 2: Data Components (Week 3-4) - HIGH PRIORITY
1. Data Grid with sorting/filtering
2. Tree View for BOM hierarchies
3. Status badges and indicators (expanded)
4. Kanban board (draggable)
5. Timeline component for change history
6. Pencil component library (core UI elements)

### Phase 3: PLM Components (Week 5-6) - HIGH PRIORITY
1. BOM Tree View (specialized for product structures)
2. Approval workflow diagram
3. Version diff viewer
4. CAD file preview card
5. Gantt chart for project timelines
6. Pencil PLM-specific components

### Phase 4: Polish & Integration (Week 7-8) - MEDIUM PRIORITY
1. Dashboard widget grid
2. Command palette
3. Empty states and error boundaries
4. Advanced form components
5. Pencil design-to-code export
6. Documentation site

### Phase 5: Enhancement (Future) - NICE TO HAVE
1. Data visualization components (charts)
2. Rich text editor
3. File upload with drag-drop
4. Accessibility enhancements
5. Performance optimization
6. Mobile-responsive refinement

## Acceptance Criteria

### Design System Documentation
- [ ] All design tokens documented with use cases
- [ ] Component API reference with examples
- [ ] Design guidelines for common patterns
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Responsive behavior documented

### Pencil Integration
- [ ] Pencil canvas template opens with correct design tokens
- [ ] Component library panel contains at least 20 core components
- [ ] Design tokens sync between Pencil and codebase
- [ ] Export generates valid React/TypeScript code
- [ ] Exported code passes linting and type checking

### Component Quality
- [ ] All components have TypeScript types
- [ ] All components support light/dark themes
- [ ] All components have keyboard navigation
- [ ] All components have focus indicators
- [ ] All components have loading/error states

### Developer Experience
- [ ] Components are tree-shakeable
- [ ] Components follow consistent API patterns
- [ ] Storybook or similar for component preview
- [ ] Migration guide for existing code
- [ ] Performance budgets met (bundle size, render time)

## Risks and Constraints

### Technical Risks
1. **Pencil MCP Maturity**: Pencil MCP is experimental; may have limitations
   - Mitigation: Start with basic components, expand incrementally

2. **Design Token Sync**: Keeping tokens in sync between Pencil and code
   - Mitigation: Single source of truth, automated sync scripts

3. **Component Performance**: Complex components (tree view, gantt) may be slow
   - Mitigation: Virtual scrolling, lazy loading, performance testing

4. **Bundle Size**: Many components increase initial load
   - Mitigation: Tree-shaking, code splitting, dynamic imports

### Design Risks
1. **Inconsistency Without Enforcement**: Developers may bypass design system
   - Mitigation: Linting rules, code review checklist, component presets

2. **Over-Engineering**: Building too many variants
   - Mitigation: MVP scope, iterative expansion based on usage

3. **Accessibility Gaps**: Complex components may have a11y issues
   - Mitigation: A11y testing, screen reader validation, keyboard-only testing

### Resource Constraints
1. **Limited Design Resources**: No dedicated designer
   - Mitigation: Pencil MCP enables developer-driven design

2. **Documentation Maintenance**: Keeping docs in sync with code
   - Mitigation: Automated doc generation from TypeScript types

3. **Browser Support**: Modern APIs may not work in older browsers
   - Mitigation: Progressive enhancement, polyfills for critical features

### Business Constraints
1. **Timeline Pressure**: Need MVP quickly
   - Mitigation: Phase 1 scope minimal, expand based on feedback

2. **Stakeholder Expectations**: May want more than MVP delivers
   - Mitigation: Clear communication of scope, roadmap transparency

## Dependencies

### External
- Next.js 15 (React 19, App Router)
- Radix UI (primitives)
- Tailwind CSS (styling)
- Lucide React (icons)
- Pencil MCP (design tool)

### Internal
- Existing design tokens (design-tokens.ts)
- Existing component base (shadcn/ui)
- Theme system (globals.css)
- Module structure (src/components, src/app)

### Integration Points
- tRPC for API calls
- Authentication system (auth store)
- Routing (Next.js App Router)
- State management (Zustand)

## Success Metrics

- **Component Reusability**: 80% of UI built from design system components
- **Design Consistency**: 95% adherence to design tokens
- **Developer Velocity**: 50% faster UI development with design system
- **User Satisfaction**: NPS > 70 for design quality
- **Performance**: Lighthouse score > 90 for all pages
- **Accessibility**: WCAG 2.1 AA compliance

## Next Steps

1. Validate requirements with stakeholders
2. Create detailed component specifications
3. Set up Pencil MCP integration test
4. Build Phase 1 foundation components
5. Establish design system documentation
6. Iterate based on feedback
