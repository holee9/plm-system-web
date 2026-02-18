# Implementation Plan: SPEC-PLM-009

**SPEC ID**: SPEC-PLM-009
**Title**: Change Order Advanced Features - Export and Batch Processing
**Development Mode**: Hybrid (TDD for new components, DDD for existing service modifications)

---

## Milestones

### Primary Goal: Export Functionality (C-003)

**Priority**: High
**Objective**: Implement CSV and PDF export for change orders

#### Tasks

1. **Create Export Utilities Module**
   - Create `src/modules/plm/export.ts`
   - Implement CSV generation function with field selection
   - Implement PDF generation function with formatting
   - Add metadata inclusion (export date, project info, filters)

2. **Create Export Dialog Component**
   - Create `src/components/changes/export-dialog.tsx`
   - Implement format selection (CSV/PDF)
   - Implement scope selection (all/selected/filtered)
   - Implement field selection checkboxes
   - Connect to tRPC export procedures

3. **Add PDF Export Procedure**
   - Modify `src/modules/plm/router.ts`
   - Add `exportPdf` procedure with input validation
   - Generate formatted PDF with tables and headers
   - Return Base64 encoded PDF for download

4. **Integrate Export into UI**
   - Modify `src/app/projects/[key]/changes/change-order-list-client.tsx`
   - Add export button to toolbar
   - Connect export dialog
   - Handle download workflow

### Secondary Goal: Batch Processing (C-004)

**Priority**: High
**Objective**: Implement batch approve and batch reject operations

#### Tasks

1. **Create Selection State Management**
   - Create `src/components/changes/selection-provider.tsx`
   - Implement React context for selection state
   - Add selection/deselection functions
   - Add select all/clear all functions
   - Persist selection across re-renders

2. **Create Batch Action Components**
   - Create `src/components/changes/batch-actions.tsx`
   - Create `src/components/changes/batch-confirm-dialog.tsx`
   - Implement batch action toolbar with count display
   - Implement confirmation dialog with item preview
   - Implement progress indicator during execution

3. **Add Batch Processing Procedures**
   - Modify `src/modules/plm/router.ts`
   - Add `batchApprove` procedure with transaction
   - Add `batchReject` procedure with transaction
   - Implement error handling for partial failures
   - Return detailed results (success/failure counts)

4. **Implement Batch Service Functions**
   - Modify `src/modules/plm/change-order-service.ts`
   - Add `batchApproveChangeOrders` function
   - Add `batchRejectChangeOrders` function
   - Use Drizzle transaction for atomicity
   - Log all operations to audit trail

5. **Integrate Batch Actions into UI**
   - Modify `src/components/changes/change-order-list.tsx`
   - Add checkbox column for selection
   - Add selection provider wrapper
   - Add batch action toolbar
   - Handle batch operation results

### Tertiary Goal: Testing and Quality

**Priority**: Medium
**Objective**: Ensure code quality and test coverage

#### Tasks

1. **Unit Tests for Export Module**
   - Test CSV generation with various field combinations
   - Test PDF generation output structure
   - Test metadata inclusion

2. **Unit Tests for Batch Processing**
   - Test batch approve logic
   - Test batch reject logic
   - Test partial failure handling
   - Test permission validation

3. **Integration Tests**
   - Test export workflow end-to-end
   - Test batch operation workflow
   - Test selection persistence

4. **E2E Tests (Optional)**
   - Test export dialog interaction
   - Test batch operation UI flow

---

## Technical Approach

### Export Implementation Strategy

#### CSV Export (Enhancement)

```typescript
// src/modules/plm/export.ts
interface ExportOptions {
  fields: ('number' | 'title' | 'status' | 'type' | 'priority' | 'createdAt' | 'requester')[];
  includeMetadata: boolean;
}

export function generateChangeOrdersCsv(
  orders: ChangeOrder[],
  options: ExportOptions,
  projectInfo: { name: string; key: string }
): string {
  // Implementation with papaparse or native CSV
}
```

#### PDF Export (New)

```typescript
// Using jsPDF with jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateChangeOrdersPdf(
  orders: ChangeOrder[],
  projectInfo: { name: string; key: string },
  filters: ExportFilters
): Buffer {
  const doc = new jsPDF();

  // Header with project info
  doc.setFontSize(18);
  doc.text(`Change Orders Report - ${projectInfo.name}`, 14, 22);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.text(`Filters: ${formatFilters(filters)}`, 14, 40);

  // Table
  autoTable(doc, {
    startY: 50,
    head: [['Number', 'Title', 'Type', 'Status', 'Priority', 'Created']],
    body: orders.map(o => [
      o.number,
      o.title,
      o.type,
      o.status,
      o.priority,
      formatDate(o.createdAt)
    ]),
  });

  return Buffer.from(doc.output('arraybuffer'));
}
```

### Batch Processing Strategy

#### Selection State Management

```typescript
// src/components/changes/selection-provider.tsx
import { createContext, useContext, useState, useCallback } from 'react';

interface SelectionContextType {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectionCount: number;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ... other methods
}
```

#### Batch Processing with Transactions

```typescript
// src/modules/plm/change-order-service.ts
export async function batchApproveChangeOrders(
  changeOrderIds: string[],
  userId: string,
  comment?: string
): Promise<BatchResult> {
  const results: BatchResult = { successCount: 0, failedCount: 0, errors: [] };

  await db.transaction(async (tx) => {
    for (const id of changeOrderIds) {
      try {
        // Validate state transition
        const order = await tx.query.changeOrders.findFirst({ where: eq(changeOrders.id, id) });
        if (!order || order.status !== 'in_review') {
          results.errors.push({ id, reason: 'Invalid status for approval' });
          results.failedCount++;
          continue;
        }

        // Update approver record
        await tx.update(changeOrderApprovers)
          .set({ status: 'approved', comment, reviewedAt: new Date() })
          .where(and(
            eq(changeOrderApprovers.changeOrderId, id),
            eq(changeOrderApprovers.approverId, userId)
          ));

        // Check if all approvers approved
        const approvers = await tx.query.changeOrderApprovers.findMany({
          where: eq(changeOrderApprovers.changeOrderId, id)
        });

        if (approvers.every(a => a.status === 'approved')) {
          await tx.update(changeOrders)
            .set({ status: 'approved', updatedAt: new Date() })
            .where(eq(changeOrders.id, id));

          // Audit trail
          await tx.insert(changeOrderAuditTrail).values({
            changeOrderId: id,
            fromStatus: 'in_review',
            toStatus: 'approved',
            changedBy: userId,
            comment: 'Batch approved',
          });
        }

        results.successCount++;
      } catch (error) {
        results.errors.push({ id, reason: error instanceof Error ? error.message : 'Unknown error' });
        results.failedCount++;
      }
    }
  });

  return results;
}
```

---

## File Dependency Graph

```
Export Feature:
  export.ts (standalone utilities)
  export-dialog.tsx (uses export.ts via tRPC)
  change-order-list-client.tsx (includes export-dialog.tsx)
  router.ts (adds exportPdf procedure)
    └── export.ts (PDF generation logic)

Batch Processing:
  selection-provider.tsx (standalone context)
  batch-actions.tsx (uses selection-provider context)
  batch-confirm-dialog.tsx (uses tRPC batch procedures)
  change-order-list.tsx (wraps with selection-provider)
    └── batch-actions.tsx (toolbar)
  change-order-service.ts (batch functions)
  router.ts (adds batch procedures)
    └── change-order-service.ts
```

---

## Execution Order

### Phase 1: Export Feature (Priority High)

```
Step 1: Create export utilities
$ Create src/modules/plm/export.ts

Step 2: Create export dialog component
$ Create src/components/changes/export-dialog.tsx

Step 3: Add PDF export procedure
$ Modify src/modules/plm/router.ts

Step 4: Integrate export UI
$ Modify src/app/projects/[key]/changes/change-order-list-client.tsx

Step 5: Test export functionality
$ npm test -- --grep "export"
```

### Phase 2: Batch Processing (Priority High)

```
Step 1: Create selection provider
$ Create src/components/changes/selection-provider.tsx

Step 2: Create batch action components
$ Create src/components/changes/batch-actions.tsx
$ Create src/components/changes/batch-confirm-dialog.tsx

Step 3: Add batch service functions
$ Modify src/modules/plm/change-order-service.ts

Step 4: Add batch procedures
$ Modify src/modules/plm/router.ts

Step 5: Integrate batch UI
$ Modify src/components/changes/change-order-list.tsx

Step 6: Test batch functionality
$ npm test -- --grep "batch"
```

### Phase 3: Quality Assurance (Priority Medium)

```
Step 1: Run type check
$ npm run typecheck

Step 2: Run lint
$ npm run lint

Step 3: Run all tests
$ npm test

Step 4: Verify coverage
$ npm test -- --coverage
```

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| PDF library bundle size | Use dynamic import for jsPDF |
| Large batch timeout | Implement 50-item limit, use background jobs if needed |
| Selection state memory | Clear selection after batch operation |
| Export file naming conflicts | Include timestamp in filename |

---

## Success Criteria

- [ ] CSV export works with field selection
- [ ] PDF export generates formatted report
- [ ] Export respects current filters
- [ ] Multi-select works in change order list
- [ ] Batch approve processes multiple items
- [ ] Batch reject processes multiple items
- [ ] Progress indicator shows during batch operations
- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Coverage meets 85% threshold

---

## Next Steps

After SPEC-PLM-009 completion:

1. Run `/moai:2-run SPEC-PLM-009` for implementation
2. Execute `/moai:3-sync SPEC-PLM-009` for documentation sync
3. Continue with remaining P3 features

---

## Expert Consultation Recommendations

### Required Consultations

1. **expert-frontend**: Export dialog and batch action UI review
   - User experience optimization
   - Progress indicator design
   - Error handling in UI

2. **expert-backend**: Batch processing transaction handling
   - Transaction isolation level
   - Partial failure handling
   - Performance optimization

### Optional Consultations

- **expert-testing**: E2E test design for batch operations
- **expert-security**: Permission validation for batch operations
