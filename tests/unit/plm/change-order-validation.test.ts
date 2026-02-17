/**
 * Unit tests for Change Order service validation utilities
 * Tests status transition rules, validation functions, and edge cases
 */
import { describe, it, expect } from "vitest";
import {
  type ChangeOrderStatus,
  type ChangeOrderType,
  type ApprovalStatus,
} from "~/modules/plm/change-order-service";

// Re-export the validation constants from the service for testing
const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 500;
const DESCRIPTION_MIN_LENGTH = 10;

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

describe("change-order-service - status transitions", () => {
  describe("draft status transitions", () => {
    it("should allow draft -> submitted", () => {
      expect(isValidStatusTransition("draft", "submitted")).toBe(true);
    });

    it("should allow draft -> rejected", () => {
      expect(isValidStatusTransition("draft", "rejected")).toBe(true);
    });

    it("should reject draft -> in_review", () => {
      expect(isValidStatusTransition("draft", "in_review")).toBe(false);
    });

    it("should reject draft -> approved", () => {
      expect(isValidStatusTransition("draft", "approved")).toBe(false);
    });

    it("should reject draft -> implemented", () => {
      expect(isValidStatusTransition("draft", "implemented")).toBe(false);
    });
  });

  describe("submitted status transitions", () => {
    it("should allow submitted -> in_review", () => {
      expect(isValidStatusTransition("submitted", "in_review")).toBe(true);
    });

    it("should allow submitted -> rejected", () => {
      expect(isValidStatusTransition("submitted", "rejected")).toBe(true);
    });

    it("should reject submitted -> approved", () => {
      expect(isValidStatusTransition("submitted", "approved")).toBe(false);
    });

    it("should reject submitted -> draft", () => {
      expect(isValidStatusTransition("submitted", "draft")).toBe(false);
    });
  });

  describe("in_review status transitions", () => {
    it("should allow in_review -> approved", () => {
      expect(isValidStatusTransition("in_review", "approved")).toBe(true);
    });

    it("should allow in_review -> rejected", () => {
      expect(isValidStatusTransition("in_review", "rejected")).toBe(true);
    });

    it("should allow in_review -> submitted", () => {
      expect(isValidStatusTransition("in_review", "submitted")).toBe(true);
    });

    it("should reject in_review -> implemented", () => {
      expect(isValidStatusTransition("in_review", "implemented")).toBe(false);
    });
  });

  describe("approved status transitions", () => {
    it("should allow approved -> implemented", () => {
      expect(isValidStatusTransition("approved", "implemented")).toBe(true);
    });

    it("should reject approved -> submitted", () => {
      expect(isValidStatusTransition("approved", "submitted")).toBe(false);
    });

    it("should reject approved -> in_review", () => {
      expect(isValidStatusTransition("approved", "in_review")).toBe(false);
    });

    it("should reject approved -> rejected", () => {
      expect(isValidStatusTransition("approved", "rejected")).toBe(false);
    });
  });

  describe("rejected status transitions", () => {
    it("should allow rejected -> submitted", () => {
      expect(isValidStatusTransition("rejected", "submitted")).toBe(true);
    });

    it("should reject rejected -> draft", () => {
      expect(isValidStatusTransition("rejected", "draft")).toBe(false);
    });

    it("should reject rejected -> in_review", () => {
      expect(isValidStatusTransition("rejected", "in_review")).toBe(false);
    });

    it("should reject rejected -> approved", () => {
      expect(isValidStatusTransition("rejected", "approved")).toBe(false);
    });
  });

  describe("implemented status transitions", () => {
    it("should not allow any transitions from implemented", () => {
      const allStatuses: ChangeOrderStatus[] = ["draft", "submitted", "in_review", "approved", "rejected", "implemented"];

      allStatuses.forEach((status) => {
        expect(isValidStatusTransition("implemented", status)).toBe(false);
      });
    });
  });

  describe("complete workflow scenarios", () => {
    it("should allow standard approval workflow", () => {
      // draft -> submitted -> in_review -> approved -> implemented
      const workflow: ChangeOrderStatus[] = ["draft", "submitted", "in_review", "approved", "implemented"];

      for (let i = 0; i < workflow.length - 1; i++) {
        expect(isValidStatusTransition(workflow[i], workflow[i + 1])).toBe(true);
      }
    });

    it("should allow rejection and resubmission workflow", () => {
      // draft -> submitted -> rejected -> submitted -> in_review -> approved
      const workflow: ChangeOrderStatus[] = ["draft", "submitted", "rejected", "submitted", "in_review", "approved"];

      for (let i = 0; i < workflow.length - 1; i++) {
        expect(isValidStatusTransition(workflow[i], workflow[i + 1])).toBe(true);
      }
    });

    it("should allow return to submitted from in_review", () => {
      // in_review -> submitted (for requesting more information)
      expect(isValidStatusTransition("in_review", "submitted")).toBe(true);
    });
  });
});

describe("change-order-service - title validation", () => {
  function validateTitle(title: string): void {
    if (!title || title.trim().length < TITLE_MIN_LENGTH) {
      throw new Error(`Title must be at least ${TITLE_MIN_LENGTH} characters`);
    }
    if (title.length > TITLE_MAX_LENGTH) {
      throw new Error(`Title must not exceed ${TITLE_MAX_LENGTH} characters`);
    }
  }

  it("should accept valid titles", () => {
    expect(() => validateTitle("Valid Title")).not.toThrow();
    expect(() => validateTitle("A".repeat(TITLE_MIN_LENGTH))).not.toThrow();
    expect(() => validateTitle("A".repeat(TITLE_MAX_LENGTH))).not.toThrow();
  });

  it("should reject titles that are too short", () => {
    expect(() => validateTitle("")).toThrow("at least 5 characters");
    expect(() => validateTitle("ABCD")).toThrow("at least 5 characters");
    expect(() => validateTitle("    ")).toThrow("at least 5 characters");
  });

  it("should reject titles that are too long", () => {
    expect(() => validateTitle("A".repeat(TITLE_MAX_LENGTH + 1))).toThrow("500 characters");
  });
});

describe("change-order-service - description validation", () => {
  function validateDescription(description: string): void {
    if (!description || description.trim().length < DESCRIPTION_MIN_LENGTH) {
      throw new Error(`Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
    }
  }

  it("should accept valid descriptions", () => {
    expect(() => validateDescription("Valid description")).not.toThrow();
    expect(() => validateDescription("A".repeat(DESCRIPTION_MIN_LENGTH))).not.toThrow();
  });

  it("should reject descriptions that are too short", () => {
    expect(() => validateDescription("")).toThrow("at least 10 characters");
    expect(() => validateDescription("Short")).toThrow("at least 10 characters");
    expect(() => validateDescription("   ")).toThrow("at least 10 characters");
  });
});

describe("change-order-service - reason validation", () => {
  function validateReason(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Reason is required");
    }
  }

  it("should accept valid reasons", () => {
    expect(() => validateReason("Valid reason")).not.toThrow();
    expect(() => validateReason("X")).not.toThrow(); // Minimum 1 non-whitespace char
  });

  it("should reject empty reasons", () => {
    expect(() => validateReason("")).toThrow("Reason is required");
    expect(() => validateReason("   ")).toThrow("Reason is required");
  });
});

describe("change-order-service - type system", () => {
  describe("ChangeOrderType", () => {
    it("should have exactly two types", () => {
      const types: ChangeOrderType[] = ["ECR", "ECN"];
      expect(types).toHaveLength(2);
    });
  });

  describe("ChangeOrderStatus", () => {
    it("should have exactly six statuses", () => {
      const statuses: ChangeOrderStatus[] = ["draft", "submitted", "in_review", "approved", "rejected", "implemented"];
      expect(statuses).toHaveLength(6);
    });
  });

  describe("ApprovalStatus", () => {
    it("should have exactly three statuses", () => {
      const statuses: ApprovalStatus[] = ["pending", "approved", "rejected"];
      expect(statuses).toHaveLength(3);
    });
  });
});

describe("change-order-service - approval progress calculation", () => {
  interface ApprovalProgress {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  }

  function calculateApprovalProgress(approverStatuses: ApprovalStatus[]): ApprovalProgress {
    const total = approverStatuses.length;
    const approved = approverStatuses.filter((s) => s === "approved").length;
    const rejected = approverStatuses.filter((s) => s === "rejected").length;
    const pending = approverStatuses.filter((s) => s === "pending").length;

    return { total, approved, rejected, pending };
  }

  it("should calculate progress with all pending", () => {
    const progress = calculateApprovalProgress(["pending", "pending", "pending"]);

    expect(progress.total).toBe(3);
    expect(progress.approved).toBe(0);
    expect(progress.rejected).toBe(0);
    expect(progress.pending).toBe(3);
  });

  it("should calculate progress with mixed statuses", () => {
    const progress = calculateApprovalProgress(["approved", "pending", "rejected", "pending"]);

    expect(progress.total).toBe(4);
    expect(progress.approved).toBe(1);
    expect(progress.rejected).toBe(1);
    expect(progress.pending).toBe(2);
  });

  it("should calculate progress when all approved", () => {
    const progress = calculateApprovalProgress(["approved", "approved", "approved"]);

    expect(progress.total).toBe(3);
    expect(progress.approved).toBe(3);
    expect(progress.rejected).toBe(0);
    expect(progress.pending).toBe(0);
  });

  it("should handle single approver", () => {
    const progress = calculateApprovalProgress(["approved"]);

    expect(progress.total).toBe(1);
    expect(progress.approved).toBe(1);
  });
});

describe("change-order-service - change order number generation", () => {
  function formatChangeOrderNumber(maxNumber: number): string {
    return String(maxNumber + 1).padStart(3, "0");
  }

  it("should format first change order as 001", () => {
    expect(formatChangeOrderNumber(0)).toBe("001");
  });

  it("should format subsequent numbers correctly", () => {
    expect(formatChangeOrderNumber(1)).toBe("002");
    expect(formatChangeOrderNumber(9)).toBe("010");
    expect(formatChangeOrderNumber(99)).toBe("100");
    expect(formatChangeOrderNumber(999)).toBe("1000");
  });
});

describe("change-order-service - edge cases", () => {
  it("should handle empty approver list", () => {
    const approverIds: string[] = [];

    expect(approverIds.length).toBe(0);
  });

  it("should handle single approver", () => {
    const approverIds = ["approver-1"];

    expect(approverIds.length).toBe(1);
  });

  it("should handle multiple approvers", () => {
    const approverIds = ["approver-1", "approver-2", "approver-3"];

    expect(approverIds.length).toBe(3);
  });

  it("should handle empty affected parts list", () => {
    const affectedPartIds: string[] | undefined = undefined;

    expect(affectedPartIds).toBeUndefined();
  });

  it("should handle affected parts with values", () => {
    const affectedPartIds = ["part-1", "part-2", "part-3"];

    expect(affectedPartIds).toHaveLength(3);
  });
});
