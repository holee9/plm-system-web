/**
 * Integration tests for Change Order Complete Workflow
 * Tests end-to-end lifecycle from creation to implementation
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createChangeOrder,
  getChangeOrderById,
  updateChangeOrder,
  submitChangeOrder,
  acceptForReview,
  reviewChangeOrder,
  implementChangeOrder,
  listChangeOrders,
  getAuditTrail,
  type ChangeOrderWithDetails,
  type CreateChangeOrderInput,
} from "~/modules/plm/change-order-service";
import { db } from "~/server/db";
import { changeOrders, changeOrderApprovers, changeOrderAuditTrail, changeOrderAffectedParts } from "~/server/db/change-orders";
import { users } from "~/server/db/users";
import { projects } from "~/server/db/projects";
import { eq } from "drizzle-orm";

// Test data helpers
function createMockProject(overrides = {}) {
  return {
    name: "Test Project",
    key: "TEST-" + Math.floor(Math.random() * 10000),
    description: "Test project for change orders",
    ...overrides,
  };
}

function createMockUser(overrides = {}) {
  return {
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    ...overrides,
  };
}

function createMockChangeOrderInput(projectId: string): CreateChangeOrderInput {
  return {
    projectId,
    type: "ECR",
    title: "Test Engineering Change Request",
    description: "This is a detailed description of the engineering change request that meets minimum requirements",
    reason: "Need to improve product performance",
    approverIds: [],
  };
}

describe("change-order-service - complete lifecycle workflow", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverIds: string[];

  beforeEach(async () => {
    // Create test users
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver1] = await db.insert(users).values(createMockUser({ name: "Approver1" })).returning();
    const [approver2] = await db.insert(users).values(createMockUser({ name: "Approver2" })).returning();
    testRequesterId = requester.id;
    testApproverIds = [approver1.id, approver2.id];

    // Create test project
    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;
  });

  afterEach(async () => {
    // Cleanup in reverse order of dependencies
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  describe("standard approval workflow (ECR)", () => {
    it("should complete full lifecycle from draft to implemented", async () => {
      // Step 1: Create change order
      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      let co = await createChangeOrder(input, testRequesterId);
      expect(co.status).toBe("draft");
      expect(co.number).toBe("001");
      const changeOrderId = co.id;

      // Step 2: Update while in draft
      co = await updateChangeOrder(
        { changeOrderId, title: "Updated Title" },
        testRequesterId
      );
      expect(co.title).toBe("Updated Title");
      expect(co.status).toBe("draft");

      // Step 3: Submit for review
      co = await submitChangeOrder({ changeOrderId }, testRequesterId);
      expect(co.status).toBe("submitted");

      // Step 4: Accept for review
      co = await acceptForReview(changeOrderId, testApproverIds[0]);
      expect(co.status).toBe("in_review");

      // Step 5: First approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved", comment: "Looks good" },
        testApproverIds[0]
      );
      expect(co.status).toBe("in_review"); // Still waiting for second approver
      expect(co.approvalProgress?.approved).toBe(1);
      expect(co.approvalProgress?.pending).toBe(1);

      // Step 6: Second approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved", comment: "Approved" },
        testApproverIds[1]
      );
      expect(co.status).toBe("approved");
      expect(co.approvalProgress?.approved).toBe(2);

      // Step 7: Implement change order
      co = await implementChangeOrder(
        { changeOrderId, revisionId: "revision-1" },
        testRequesterId
      );
      expect(co.status).toBe("implemented");
      expect(co.implementedAt).toBeDefined();
      expect(co.implementedRevisionId).toBe("revision-1");

      // Verify audit trail
      const auditTrail = await getAuditTrail(changeOrderId);
      expect(auditTrail).toHaveLength(6); // submit, accept, approve, approve, implement
    });

    it("should prevent modification after submission", async () => {
      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      let co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      // Submit
      co = await submitChangeOrder({ changeOrderId }, testRequesterId);

      // Try to update after submission
      await expect(
        updateChangeOrder({ changeOrderId, title: "Should not work" }, testRequesterId)
      ).rejects.toThrow("Only draft change orders can be modified");
    });
  });

  describe("rejection and resubmission workflow", () => {
    it("should handle rejection and successful resubmission", async () => {
      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      let co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      // Submit and accept for review
      await submitChangeOrder({ changeOrderId }, testRequesterId);
      await acceptForReview(changeOrderId, testApproverIds[0]);

      // First approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[0]
      );
      expect(co.status).toBe("in_review");

      // Second approver rejects
      co = await reviewChangeOrder(
        { changeOrderId, status: "rejected", comment: "Needs more detail" },
        testApproverIds[1]
      );
      expect(co.status).toBe("rejected");

      // Verify audit trail shows rejection
      const auditTrail1 = await getAuditTrail(changeOrderId);
      const rejectionEntry = auditTrail1.find((e) => e.toStatus === "rejected");
      expect(rejectionEntry).toBeDefined();
      expect(rejectionEntry?.comment).toContain("Needs more detail");

      // Resubmit (this would be done by the requester after addressing issues)
      co = await submitChangeOrder({ changeOrderId }, testRequesterId);
      expect(co.status).toBe("submitted");

      // Verify audit trail shows resubmission
      const auditTrail2 = await getAuditTrail(changeOrderId);
      expect(auditTrail2.length).toBeGreaterThan(auditTrail1.length);
    });
  });

  describe("multi-approver scenarios", () => {
    it("should require all approvers for approval", async () => {
      // Add third approver
      const [approver3] = await db.insert(users).values(createMockUser({ name: "Approver3" })).returning();
      const threeApprovers = [...testApproverIds, approver3.id];

      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = threeApprovers;

      let co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      await submitChangeOrder({ changeOrderId }, testRequesterId);
      await acceptForReview(changeOrderId, testApproverIds[0]);

      // First approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        threeApprovers[0]
      );
      expect(co.status).toBe("in_review");

      // Second approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        threeApprovers[1]
      );
      expect(co.status).toBe("in_review"); // Still waiting for third

      // Third approver approves - now approved
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        threeApprovers[2]
      );
      expect(co.status).toBe("approved");
    });

    it("should reject immediately when any approver rejects", async () => {
      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      let co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      await submitChangeOrder({ changeOrderId }, testRequesterId);
      await acceptForReview(changeOrderId, testApproverIds[0]);

      // First approver approves
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[0]
      );
      expect(co.status).toBe("in_review");

      // Second approver rejects
      co = await reviewChangeOrder(
        { changeOrderId, status: "rejected", comment: "Cannot approve" },
        testApproverIds[1]
      );
      expect(co.status).toBe("rejected");
    });
  });

  describe("ECN workflow", () => {
    it("should handle ECN type change orders", async () => {
      const input = createMockChangeOrderInput(testProjectId);
      input.type = "ECN";
      input.title = "Engineering Change Notice";
      input.approverIds = testApproverIds;

      const co = await createChangeOrder(input, testRequesterId);
      expect(co.type).toBe("ECN");
      expect(co.number).toBe("001"); // Separate numbering for ECN

      // Full workflow should work the same
      const changeOrderId = co.id;

      await submitChangeOrder({ changeOrderId }, testRequesterId);
      await acceptForReview(changeOrderId, testApproverIds[0]);

      let updatedCo = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[0]
      );
      updatedCo = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[1]
      );

      expect(updatedCo.status).toBe("approved");
      expect(updatedCo.type).toBe("ECN");
    });
  });

  describe("affected parts tracking", () => {
    it("should track affected parts through workflow", async () => {
      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;
      input.affectedPartIds = ["part-1", "part-2", "part-3"];

      let co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      expect(co.affectedParts).toHaveLength(3);

      // Affected parts should persist through workflow
      co = await submitChangeOrder({ changeOrderId }, testRequesterId);
      expect(co.affectedParts).toHaveLength(3);

      co = await acceptForReview(changeOrderId, testApproverIds[0]);
      expect(co.affectedParts).toHaveLength(3);

      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[0]
      );
      co = await reviewChangeOrder(
        { changeOrderId, status: "approved" },
        testApproverIds[1]
      );
      expect(co.affectedParts).toHaveLength(3);

      co = await implementChangeOrder({ changeOrderId }, testRequesterId);
      expect(co.affectedParts).toHaveLength(3);
    });
  });

  describe("listing and filtering", () => {
    beforeEach(async () => {
      // Create multiple change orders
      const input1 = createMockChangeOrderInput(testProjectId);
      input1.type = "ECR";
      input1.title = "First ECR";
      input1.approverIds = [testApproverIds[0]];
      await createChangeOrder(input1, testRequesterId);

      const input2 = createMockChangeOrderInput(testProjectId);
      input2.type = "ECN";
      input2.title = "First ECN";
      input2.approverIds = [testApproverIds[0]];
      await createChangeOrder(input2, testRequesterId);

      // Submit one for review
      const listResult = await listChangeOrders(testProjectId, { limit: 10 });
      if (listResult.items.length > 0) {
        await submitChangeOrder({ changeOrderId: listResult.items[0].id }, testRequesterId);
      }
    });

    it("should list all change orders", async () => {
      const result = await listChangeOrders(testProjectId);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    it("should filter by status", async () => {
      const draftResult = await listChangeOrders(testProjectId, { status: "draft" });
      expect(draftResult.items.every((co) => co.status === "draft")).toBe(true);

      const submittedResult = await listChangeOrders(testProjectId, { status: "submitted" });
      expect(submittedResult.items.every((co) => co.status === "submitted")).toBe(true);
    });

    it("should filter by type", async () => {
      const ecrResult = await listChangeOrders(testProjectId, { type: "ECR" });
      expect(ecrResult.items.every((co) => co.type === "ECR")).toBe(true);

      const ecnResult = await listChangeOrders(testProjectId, { type: "ECN" });
      expect(ecnResult.items.every((co) => co.type === "ECN")).toBe(true);
    });
  });

  describe("permission checks", () => {
    it("should only allow requester to submit", async () => {
      const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      const co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      await expect(
        submitChangeOrder({ changeOrderId }, otherUser.id)
      ).rejects.toThrow("Only the requester can submit");
    });

    it("should only allow approvers to review", async () => {
      const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

      const input = createMockChangeOrderInput(testProjectId);
      input.approverIds = testApproverIds;

      const co = await createChangeOrder(input, testRequesterId);
      const changeOrderId = co.id;

      await submitChangeOrder({ changeOrderId }, testRequesterId);
      await acceptForReview(changeOrderId, testApproverIds[0]);

      await expect(
        reviewChangeOrder({ changeOrderId, status: "approved" }, otherUser.id)
      ).rejects.toThrow("You are not an approver");
    });
  });
});
