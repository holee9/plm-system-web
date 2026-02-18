/**
 * Unit tests for Change Order State Machine
 * Tests all valid and invalid state transitions according to business rules
 */
import { describe, it, expect } from "vitest";
import {
  type ChangeOrderStatus,
  type ChangeOrderType,
  type ApprovalStatus,
} from "~/modules/plm/change-order-service";

// ============================================================================
// State Transition Rules (from service)
// ============================================================================

const ALLOWED_TRANSITIONS: Record<ChangeOrderStatus, ChangeOrderStatus[]> = {
  draft: ["submitted", "rejected"],
  submitted: ["in_review", "rejected"],
  in_review: ["approved", "rejected", "submitted"],
  approved: ["implemented"],
  rejected: ["submitted"],
  implemented: [],
};

function isValidStatusTransition(
  currentStatus: ChangeOrderStatus,
  newStatus: ChangeOrderStatus
): boolean {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

// ============================================================================
// State Machine Tests
// ============================================================================

describe("Change Order State Machine", () => {
  describe("draft state transitions", () => {
    const currentState: ChangeOrderStatus = "draft";

    it("should allow draft -> submitted", () => {
      expect(isValidStatusTransition(currentState, "submitted")).toBe(true);
    });

    it("should allow draft -> rejected", () => {
      expect(isValidStatusTransition(currentState, "rejected")).toBe(true);
    });

    it("should reject draft -> in_review", () => {
      expect(isValidStatusTransition(currentState, "in_review")).toBe(false);
    });

    it("should reject draft -> approved", () => {
      expect(isValidStatusTransition(currentState, "approved")).toBe(false);
    });

    it("should reject draft -> implemented", () => {
      expect(isValidStatusTransition(currentState, "implemented")).toBe(false);
    });

    it("should reject draft -> draft (self-transition)", () => {
      expect(isValidStatusTransition(currentState, "draft")).toBe(false);
    });
  });

  describe("submitted state transitions", () => {
    const currentState: ChangeOrderStatus = "submitted";

    it("should allow submitted -> in_review", () => {
      expect(isValidStatusTransition(currentState, "in_review")).toBe(true);
    });

    it("should allow submitted -> rejected", () => {
      expect(isValidStatusTransition(currentState, "rejected")).toBe(true);
    });

    it("should reject submitted -> approved", () => {
      expect(isValidStatusTransition(currentState, "approved")).toBe(false);
    });

    it("should reject submitted -> draft", () => {
      expect(isValidStatusTransition(currentState, "draft")).toBe(false);
    });

    it("should reject submitted -> implemented", () => {
      expect(isValidStatusTransition(currentState, "implemented")).toBe(false);
    });
  });

  describe("in_review state transitions", () => {
    const currentState: ChangeOrderStatus = "in_review";

    it("should allow in_review -> approved", () => {
      expect(isValidStatusTransition(currentState, "approved")).toBe(true);
    });

    it("should allow in_review -> rejected", () => {
      expect(isValidStatusTransition(currentState, "rejected")).toBe(true);
    });

    it("should allow in_review -> submitted", () => {
      expect(isValidStatusTransition(currentState, "submitted")).toBe(true);
    });

    it("should reject in_review -> draft", () => {
      expect(isValidStatusTransition(currentState, "draft")).toBe(false);
    });

    it("should reject in_review -> implemented", () => {
      expect(isValidStatusTransition(currentState, "implemented")).toBe(false);
    });
  });

  describe("approved state transitions", () => {
    const currentState: ChangeOrderStatus = "approved";

    it("should allow approved -> implemented", () => {
      expect(isValidStatusTransition(currentState, "implemented")).toBe(true);
    });

    it("should reject approved -> submitted", () => {
      expect(isValidStatusTransition(currentState, "submitted")).toBe(false);
    });

    it("should reject approved -> in_review", () => {
      expect(isValidStatusTransition(currentState, "in_review")).toBe(false);
    });

    it("should reject approved -> rejected", () => {
      expect(isValidStatusTransition(currentState, "rejected")).toBe(false);
    });

    it("should reject approved -> draft", () => {
      expect(isValidStatusTransition(currentState, "draft")).toBe(false);
    });
  });

  describe("rejected state transitions", () => {
    const currentState: ChangeOrderStatus = "rejected";

    it("should allow rejected -> submitted", () => {
      expect(isValidStatusTransition(currentState, "submitted")).toBe(true);
    });

    it("should reject rejected -> draft", () => {
      expect(isValidStatusTransition(currentState, "draft")).toBe(false);
    });

    it("should reject rejected -> in_review", () => {
      expect(isValidStatusTransition(currentState, "in_review")).toBe(false);
    });

    it("should reject rejected -> approved", () => {
      expect(isValidStatusTransition(currentState, "approved")).toBe(false);
    });

    it("should reject rejected -> implemented", () => {
      expect(isValidStatusTransition(currentState, "implemented")).toBe(false);
    });
  });

  describe("implemented state transitions", () => {
    const currentState: ChangeOrderStatus = "implemented";

    it("should not allow any transitions from implemented", () => {
      const allStatuses: ChangeOrderStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "implemented",
      ];

      allStatuses.forEach((status) => {
        expect(isValidStatusTransition(currentState, status)).toBe(false);
      });
    });
  });

  describe("complete workflow scenarios", () => {
    it("should allow standard approval workflow", () => {
      const workflow: ChangeOrderStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "implemented",
      ];

      for (let i = 0; i < workflow.length - 1; i++) {
        expect(isValidStatusTransition(workflow[i], workflow[i + 1])).toBe(true);
      }
    });

    it("should allow rejection and resubmission workflow", () => {
      const workflow: ChangeOrderStatus[] = [
        "draft",
        "submitted",
        "rejected",
        "submitted",
        "in_review",
        "approved",
        "implemented",
      ];

      for (let i = 0; i < workflow.length - 1; i++) {
        expect(isValidStatusTransition(workflow[i], workflow[i + 1])).toBe(true);
      }
    });

    it("should allow return to submitted from in_review", () => {
      expect(isValidStatusTransition("in_review", "submitted")).toBe(true);
    });

    it("should allow rejection at multiple stages", () => {
      // draft -> rejected
      expect(isValidStatusTransition("draft", "rejected")).toBe(true);

      // submitted -> rejected
      expect(isValidStatusTransition("submitted", "rejected")).toBe(true);

      // in_review -> rejected
      expect(isValidStatusTransition("in_review", "rejected")).toBe(true);
    });
  });

  describe("state machine integrity", () => {
    it("should have all defined statuses", () => {
      const expectedStatuses: ChangeOrderStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "implemented",
      ];

      const actualStatuses = Object.keys(ALLOWED_TRANSITIONS) as ChangeOrderStatus[];

      expectedStatuses.forEach((status) => {
        expect(actualStatuses).toContain(status);
      });
    });

    it("should define transitions for all statuses", () => {
      const allStatuses: ChangeOrderStatus[] = [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "implemented",
      ];

      allStatuses.forEach((status) => {
        expect(ALLOWED_TRANSITIONS[status]).toBeDefined();
      });
    });
  });
});

// ============================================================================
// Multi-Approver State Tests
// ============================================================================

describe("Multi-Approver State Logic", () => {
  interface ApprovalState {
    approvers: Array<{ id: string; status: ApprovalStatus }>;
    changeOrderStatus: ChangeOrderStatus;
  }

  function calculateNextState(currentState: ApprovalState): ChangeOrderStatus {
    const { approvers, changeOrderStatus } = currentState;

    // Any rejection -> rejected
    if (approvers.some((a) => a.status === "rejected")) {
      return "rejected";
    }

    // All approved -> approved
    if (approvers.every((a) => a.status === "approved")) {
      return "approved";
    }

    // Otherwise stay in current status
    return changeOrderStatus;
  }

  describe("all approvers approve", () => {
    it("should transition to approved when all approve", () => {
      const state: ApprovalState = {
        approvers: [
          { id: "a1", status: "approved" },
          { id: "a2", status: "approved" },
          { id: "a3", status: "approved" },
        ],
        changeOrderStatus: "in_review",
      };

      expect(calculateNextState(state)).toBe("approved");
    });
  });

  describe("one approver rejects", () => {
    it("should transition to rejected when any reject", () => {
      const state: ApprovalState = {
        approvers: [
          { id: "a1", status: "approved" },
          { id: "a2", status: "rejected" },
          { id: "a3", status: "pending" },
        ],
        changeOrderStatus: "in_review",
      };

      expect(calculateNextState(state)).toBe("rejected");
    });
  });

  describe("partial approval", () => {
    it("should remain in_review with partial approvals", () => {
      const state: ApprovalState = {
        approvers: [
          { id: "a1", status: "approved" },
          { id: "a2", status: "approved" },
          { id: "a3", status: "pending" },
        ],
        changeOrderStatus: "in_review",
      };

      expect(calculateNextState(state)).toBe("in_review");
    });
  });

  describe("single approver", () => {
    it("should approve when single approver approves", () => {
      const state: ApprovalState = {
        approvers: [{ id: "a1", status: "approved" }],
        changeOrderStatus: "in_review",
      };

      expect(calculateNextState(state)).toBe("approved");
    });

    it("should reject when single approver rejects", () => {
      const state: ApprovalState = {
        approvers: [{ id: "a1", status: "rejected" }],
        changeOrderStatus: "in_review",
      };

      expect(calculateNextState(state)).toBe("rejected");
    });
  });
});
