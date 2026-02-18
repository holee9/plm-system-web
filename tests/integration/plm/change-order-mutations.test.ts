/**
 * Integration tests for Change Order Service - Additional Mutations
 * TDD GREEN Phase: Tests for delete, addApprover, removeApprover
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createChangeOrder,
  deleteChangeOrder,
  addApprover,
  removeApprover,
  getChangeOrderById,
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
    status: "active",
    visibility: "private",
    ...overrides,
  };
}

function createMockProjectWithCreator(createdById: string, overrides = {}) {
  return {
    ...createMockProject(overrides),
    createdBy: createdById,
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

describe("change-order-service - deleteChangeOrder", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

    const [project] = await db.insert(projects).values(createMockProjectWithCreator(requester.id)).returning();
    testProjectId = project.id;
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should delete draft change order", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];

    const co = await createChangeOrder(input, testRequesterId);
    const changeOrderId = co.id;

    // Verify it exists
    const beforeDelete = await getChangeOrderById(changeOrderId, testRequesterId);
    expect(beforeDelete).toBeDefined();

    // Delete it
    const result = await deleteChangeOrder(changeOrderId, testRequesterId);

    expect(result.id).toBe(changeOrderId);

    // Verify it's gone
    const afterDelete = await getChangeOrderById(changeOrderId, testRequesterId);
    expect(afterDelete).toBeNull();
  });

  it("should reject delete for non-draft status", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];

    const co = await createChangeOrder(input, testRequesterId);

    // Submit the change order (changes status from draft)
    const { submitChangeOrder } = await import("~/modules/plm/change-order-service");
    await submitChangeOrder({ changeOrderId: co.id }, testRequesterId);

    // Try to delete - should fail
    await expect(deleteChangeOrder(co.id, testRequesterId)).rejects.toThrow(
      "Only draft change orders can be deleted"
    );
  });

  it("should reject delete from non-requester", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];

    const co = await createChangeOrder(input, testRequesterId);

    await expect(deleteChangeOrder(co.id, otherUser.id)).rejects.toThrow(
      "Only the requester can delete the change order"
    );
  });

  it("should reject delete for non-existent change order", async () => {
    await expect(deleteChangeOrder("fake-id", testRequesterId)).rejects.toThrow(
      "Change order not found"
    );
  });

  it("should delete all related records", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];
    input.affectedPartIds = ["part-1", "part-2"];

    const co = await createChangeOrder(input, testRequesterId);

    // Verify related records exist
    const approvers = await db
      .select()
      .from(changeOrderApprovers)
      .where(eq(changeOrderApprovers.changeOrderId, co.id));
    expect(approvers.length).toBeGreaterThan(0);

    const affectedParts = await db
      .select()
      .from(changeOrderAffectedParts)
      .where(eq(changeOrderAffectedParts.changeOrderId, co.id));
    expect(affectedParts.length).toBeGreaterThan(0);

    // Delete
    await deleteChangeOrder(co.id, testRequesterId);

    // Verify all related records are deleted
    const approversAfter = await db
      .select()
      .from(changeOrderApprovers)
      .where(eq(changeOrderApprovers.changeOrderId, co.id));
    expect(approversAfter.length).toBe(0);

    const affectedPartsAfter = await db
      .select()
      .from(changeOrderAffectedParts)
      .where(eq(changeOrderAffectedParts.changeOrderId, co.id));
    expect(affectedPartsAfter.length).toBe(0);
  });
});

describe("change-order-service - addApprover", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;
  let testChangeOrderId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];
    const co = await createChangeOrder(input, testRequesterId);
    testChangeOrderId = co.id;
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should add approver to draft change order", async () => {
    const [newApprover] = await db.insert(users).values(createMockUser({ name: "New Approver" })).returning();

    const result = await addApprover(testChangeOrderId, newApprover.id, testRequesterId);

    expect(result.approvers).toHaveLength(2);
    expect(result.approvers?.some((a) => a.approverId === newApprover.id)).toBe(true);
  });

  it("should reject adding approver to non-draft status", async () => {
    const [newApprover] = await db.insert(users).values(createMockUser({ name: "New Approver" })).returning();

    // Submit the change order
    const { submitChangeOrder } = await import("~/modules/plm/change-order-service");
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    // Try to add approver - should fail
    await expect(addApprover(testChangeOrderId, newApprover.id, testRequesterId)).rejects.toThrow(
      "Can only add approvers to draft change orders"
    );
  });

  it("should reject add from non-requester", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();
    const [newApprover] = await db.insert(users).values(createMockUser({ name: "New Approver" })).returning();

    await expect(addApprover(testChangeOrderId, newApprover.id, otherUser.id)).rejects.toThrow(
      "Only the requester can add approvers"
    );
  });

  it("should reject non-existent approver", async () => {
    await expect(addApprover(testChangeOrderId, "fake-approver-id", testRequesterId)).rejects.toThrow(
      "Approver not found"
    );
  });

  it("should reject duplicate approver", async () => {
    // Try to add the same approver that's already there
    await expect(addApprover(testChangeOrderId, testApproverId, testRequesterId)).rejects.toThrow(
      "Approver already exists for this change order"
    );
  });

  it("should reject for non-existent change order", async () => {
    const [newApprover] = await db.insert(users).values(createMockUser({ name: "New Approver" })).returning();

    await expect(addApprover("fake-id", newApprover.id, testRequesterId)).rejects.toThrow(
      "Change order not found"
    );
  });
});

describe("change-order-service - removeApprover", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;
  let testChangeOrderId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];
    const co = await createChangeOrder(input, testRequesterId);
    testChangeOrderId = co.id;
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should remove pending approver from draft change order", async () => {
    const result = await removeApprover(testChangeOrderId, testApproverId, testRequesterId);

    expect(result.approvers).toHaveLength(0);
  });

  it("should reject removing approver from non-draft status", async () => {
    // Submit the change order
    const { submitChangeOrder } = await import("~/modules/plm/change-order-service");
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    // Try to remove approver - should fail
    await expect(removeApprover(testChangeOrderId, testApproverId, testRequesterId)).rejects.toThrow(
      "Can only remove approvers from draft change orders"
    );
  });

  it("should reject remove from non-requester", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

    await expect(removeApprover(testChangeOrderId, testApproverId, otherUser.id)).rejects.toThrow(
      "Only the requester can remove approvers"
    );
  });

  it("should reject non-existent approver", async () => {
    await expect(removeApprover(testChangeOrderId, "fake-approver-id", testRequesterId)).rejects.toThrow(
      "Approver not found for this change order"
    );
  });

  it("should reject removing non-pending approver", async () => {
    // Submit and accept for review
    const { submitChangeOrder, acceptForReview } = await import("~/modules/plm/change-order-service");
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);
    await acceptForReview(testChangeOrderId, testApproverId);

    // Approver should no longer be pending (in review now)
    // Try to remove - should fail because they're not pending
    await expect(removeApprover(testChangeOrderId, testApproverId, testRequesterId)).rejects.toThrow(
      "Can only remove pending approvers"
    );
  });

  it("should reject for non-existent change order", async () => {
    await expect(removeApprover("fake-id", testApproverId, testRequesterId)).rejects.toThrow(
      "Change order not found"
    );
  });
});
