/**
 * Integration tests for Change Order Service
 * Tests approval workflow, impact analysis, and audit trail
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
  performImpactAnalysis,
  getProjectStatistics,
  type ChangeOrderWithDetails,
  type CreateChangeOrderInput,
  type UpdateChangeOrderInput,
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

describe("change-order-service - createChangeOrder", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;

  beforeEach(async () => {
    // Create test users
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

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

  it("should create ECR with valid input", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];

    const result = await createChangeOrder(input, testRequesterId);

    expect(result).toBeDefined();
    expect(result.type).toBe("ECR");
    expect(result.title).toBe(input.title);
    expect(result.status).toBe("draft");
    expect(result.number).toBe("001"); // First change order in project
    expect(result.approvers).toHaveLength(1);
    expect(result.approvers?.[0].approverId).toBe(testApproverId);
    expect(result.approvalProgress?.total).toBe(1);
    expect(result.approvalProgress?.pending).toBe(1);
  });

  it("should create ECN with correct type", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.type = "ECN";
    input.approverIds = [testApproverId];

    const result = await createChangeOrder(input, testRequesterId);

    expect(result.type).toBe("ECN");
  });

  it("should reject title that is too short", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.title = "ABC"; // Less than 5 characters
    input.approverIds = [testApproverId];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("Title must be at least 5 characters");
  });

  it("should reject title that is too long", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.title = "A".repeat(501); // More than 500 characters
    input.approverIds = [testApproverId];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("Title must not exceed 500 characters");
  });

  it("should reject description that is too short", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.description = "Short"; // Less than 10 characters
    input.approverIds = [testApproverId];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("Description must be at least 10 characters");
  });

  it("should reject empty reason", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.reason = "   "; // Whitespace only
    input.approverIds = [testApproverId];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("Reason is required");
  });

  it("should reject when no approvers provided", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = []; // Empty array

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("At least one approver is required");
  });

  it("should reject non-existent approver", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = ["fake-approver-id"];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("One or more approvers not found");
  });

  it("should reject non-existent project", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.projectId = "fake-project-id";
    input.approverIds = [testApproverId];

    await expect(createChangeOrder(input, testRequesterId)).rejects.toThrow("Project not found");
  });

  it("should create change order with affected parts", async () => {
    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId];
    input.affectedPartIds = ["part-1", "part-2"];

    const result = await createChangeOrder(input, testRequesterId);

    expect(result.affectedParts).toHaveLength(2);
    expect(result.affectedParts?.[0].partId).toBe("part-1");
  });

  it("should generate sequential change order numbers", async () => {
    const input1 = createMockChangeOrderInput(testProjectId);
    input1.approverIds = [testApproverId];

    const result1 = await createChangeOrder(input1, testRequesterId);
    expect(result1.number).toBe("001");

    const input2 = createMockChangeOrderInput(testProjectId);
    input2.title = "Second Change Request";
    input2.approverIds = [testApproverId];

    const result2 = await createChangeOrder(input2, testRequesterId);
    expect(result2.number).toBe("002");
  });

  it("should handle multiple approvers", async () => {
    const [approver2] = await db.insert(users).values(createMockUser({ name: "Approver2" })).returning();

    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = [testApproverId, approver2.id];

    const result = await createChangeOrder(input, testRequesterId);

    expect(result.approvers).toHaveLength(2);
    expect(result.approvalProgress?.total).toBe(2);
  });
});

describe("change-order-service - getChangeOrderById", () => {
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

  it("should return change order with all details", async () => {
    const result = await getChangeOrderById(testChangeOrderId, testRequesterId);

    expect(result).toBeDefined();
    expect(result?.id).toBe(testChangeOrderId);
    expect(result?.requesterName).toBe("Requester");
    expect(result?.projectName).toBe("Test Project");
    expect(result?.approvers).toHaveLength(1);
    expect(result?.approvalProgress).toBeDefined();
  });

  it("should return null for non-existent change order", async () => {
    const result = await getChangeOrderById("fake-id", testRequesterId);

    expect(result).toBeNull();
  });
});

describe("change-order-service - updateChangeOrder", () => {
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

  it("should update change order in draft status", async () => {
    const input: UpdateChangeOrderInput = {
      changeOrderId: testChangeOrderId,
      title: "Updated Title",
      description: "Updated description with sufficient length",
    };

    const result = await updateChangeOrder(input, testRequesterId);

    expect(result.title).toBe("Updated Title");
    expect(result.description).toBe("Updated description with sufficient length");
  });

  it("should reject update for non-draft status", async () => {
    // Submit the change order first
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    const input: UpdateChangeOrderInput = {
      changeOrderId: testChangeOrderId,
      title: "Should not update",
    };

    await expect(updateChangeOrder(input, testRequesterId)).rejects.toThrow("Only draft change orders can be modified");
  });

  it("should reject update from non-requester", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

    const input: UpdateChangeOrderInput = {
      changeOrderId: testChangeOrderId,
      title: "Should not update",
    };

    await expect(updateChangeOrder(input, otherUser.id)).rejects.toThrow("Only the requester can modify the change order");
  });

  it("should update approvers", async () => {
    const [newApprover] = await db.insert(users).values(createMockUser({ name: "New Approver" })).returning();

    const input: UpdateChangeOrderInput = {
      changeOrderId: testChangeOrderId,
      approverIds: [newApprover.id],
    };

    const result = await updateChangeOrder(input, testRequesterId);

    expect(result.approvers).toHaveLength(1);
    expect(result.approvers?.[0].approverId).toBe(newApprover.id);
  });

  it("should update affected parts", async () => {
    const input: UpdateChangeOrderInput = {
      changeOrderId: testChangeOrderId,
      affectedPartIds: ["new-part-1", "new-part-2"],
    };

    const result = await updateChangeOrder(input, testRequesterId);

    expect(result.affectedParts).toHaveLength(2);
    expect(result.affectedParts?.[0].partId).toBe("new-part-1");
  });
});

describe("change-order-service - submitChangeOrder", () => {
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

  it("should submit change order from draft to submitted", async () => {
    const result = await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    expect(result.status).toBe("submitted");
  });

  it("should create audit trail on submit", async () => {
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    const auditTrail = await getAuditTrail(testChangeOrderId);

    expect(auditTrail).toHaveLength(1);
    expect(auditTrail[0].fromStatus).toBe("draft");
    expect(auditTrail[0].toStatus).toBe("submitted");
    expect(auditTrail[0].comment).toBe("Submitted for review");
  });

  it("should reject submit from non-requester", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

    await expect(submitChangeOrder({ changeOrderId: testChangeOrderId }, otherUser.id))
      .rejects.toThrow("Only the requester can submit the change order");
  });

  it("should reject submit from non-draft status", async () => {
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    await expect(submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId))
      .rejects.toThrow("Cannot submit change order from submitted status");
  });

  it("should reject for non-existent change order", async () => {
    await expect(submitChangeOrder({ changeOrderId: "fake-id" }, testRequesterId))
      .rejects.toThrow("Change order not found");
  });
});

describe("change-order-service - review workflow", () => {
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

    // Submit and accept for review
    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);
    await acceptForReview(testChangeOrderId, testApproverId);
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should approve change order with single approver", async () => {
    const result = await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "approved", comment: "Looks good" },
      testApproverId
    );

    expect(result.status).toBe("approved");
  });

  it("should reject change order", async () => {
    const result = await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "rejected", comment: "Needs more work" },
      testApproverId
    );

    expect(result.status).toBe("rejected");
  });

  it("should create audit trail on approval", async () => {
    await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "approved" },
      testApproverId
    );

    const auditTrail = await getAuditTrail(testChangeOrderId);
    const approvalEntry = auditTrail.find((a) => a.toStatus === "approved");

    expect(approvalEntry).toBeDefined();
    expect(approvalEntry?.comment).toContain("Approved");
  });

  it("should reject review from non-approver", async () => {
    const [otherUser] = await db.insert(users).values(createMockUser({ name: "Other" })).returning();

    await expect(reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "approved" },
      otherUser.id
    )).rejects.toThrow("You are not an approver for this change order");
  });

  it("should update approver status with comment", async () => {
    await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "approved", comment: "Approved with minor notes" },
      testApproverId
    );

    const co = await getChangeOrderById(testChangeOrderId, testRequesterId);
    const approver = co?.approvers?.[0];

    expect(approver?.status).toBe("approved");
    expect(approver?.comment).toBe("Approved with minor notes");
    expect(approver?.reviewedAt).toBeDefined();
  });
});

describe("change-order-service - multi-approver workflow", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let approverIds: string[];
  let testChangeOrderId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    testRequesterId = requester.id;

    const [approver1] = await db.insert(users).values(createMockUser({ name: "Approver1" })).returning();
    const [approver2] = await db.insert(users).values(createMockUser({ name: "Approver2" })).returning();
    const [approver3] = await db.insert(users).values(createMockUser({ name: "Approver3" })).returning();
    approverIds = [approver1.id, approver2.id, approver3.id];

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    const input = createMockChangeOrderInput(testProjectId);
    input.approverIds = approverIds;
    const co = await createChangeOrder(input, testRequesterId);
    testChangeOrderId = co.id;

    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);
    await acceptForReview(testChangeOrderId, testRequesterId);
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should remain in_review with partial approvals", async () => {
    // First approver approves
    const result1 = await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "approved" },
      approverIds[0]
    );

    expect(result1.status).toBe("in_review");
    expect(result1.approvalProgress?.approved).toBe(1);
    expect(result1.approvalProgress?.pending).toBe(2);
  });

  it("should approve when all approvers approve", async () => {
    await reviewChangeOrder({ changeOrderId: testChangeOrderId, status: "approved" }, approverIds[0]);
    await reviewChangeOrder({ changeOrderId: testChangeOrderId, status: "approved" }, approverIds[1]);
    const result = await reviewChangeOrder({ changeOrderId: testChangeOrderId, status: "approved" }, approverIds[2]);

    expect(result.status).toBe("approved");
    expect(result.approvalProgress?.approved).toBe(3);
  });

  it("should reject when any approver rejects", async () => {
    await reviewChangeOrder({ changeOrderId: testChangeOrderId, status: "approved" }, approverIds[0]);
    const result = await reviewChangeOrder(
      { changeOrderId: testChangeOrderId, status: "rejected", comment: "Found issues" },
      approverIds[1]
    );

    expect(result.status).toBe("rejected");
  });
});

describe("change-order-service - implementChangeOrder", () => {
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

    await submitChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);
    await acceptForReview(testChangeOrderId, testApproverId);
    await reviewChangeOrder({ changeOrderId: testChangeOrderId, status: "approved" }, testApproverId);
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should implement approved change order", async () => {
    const revisionId = "revision-123";
    const result = await implementChangeOrder(
      { changeOrderId: testChangeOrderId, revisionId },
      testRequesterId
    );

    expect(result.status).toBe("implemented");
    expect(result.implementedAt).toBeDefined();
    expect(result.implementedRevisionId).toBe(revisionId);
  });

  it("should create audit trail on implementation", async () => {
    await implementChangeOrder({ changeOrderId: testChangeOrderId }, testRequesterId);

    const auditTrail = await getAuditTrail(testChangeOrderId);
    const implEntry = auditTrail.find((a) => a.toStatus === "implemented");

    expect(implEntry).toBeDefined();
    expect(implEntry?.comment).toBe("Change implemented");
  });

  it("should reject implementation from wrong status", async () => {
    // Create another CO in draft
    const input = createMockChangeOrderInput(testProjectId);
    input.title = "Another draft CO";
    input.approverIds = [testApproverId];
    const draftCo = await createChangeOrder(input, testRequesterId);

    await expect(implementChangeOrder({ changeOrderId: draftCo.id }, testRequesterId))
      .rejects.toThrow("Cannot implement change order from draft status");
  });
});

describe("change-order-service - listChangeOrders", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    // Create multiple change orders with different statuses
    const input1 = createMockChangeOrderInput(testProjectId);
    input1.approverIds = [testApproverId];
    await createChangeOrder(input1, testRequesterId);

    const input2 = createMockChangeOrderInput(testProjectId);
    input2.title = "Second Change Request";
    input2.type = "ECN";
    input2.approverIds = [testApproverId];
    await createChangeOrder(input2, testRequesterId);
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should list all change orders in project", async () => {
    const result = await listChangeOrders(testProjectId);

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
  });

  it("should filter by status", async () => {
    const result = await listChangeOrders(testProjectId, { status: "draft" });

    expect(result.total).toBe(2);
    expect(result.items[0].status).toBe("draft");
  });

  it("should filter by type", async () => {
    const result = await listChangeOrders(testProjectId, { type: "ECR" });

    expect(result.total).toBe(1);
    expect(result.items[0].type).toBe("ECR");
  });

  it("should paginate results", async () => {
    const result = await listChangeOrders(testProjectId, { limit: 1, offset: 0 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(2);
  });
});

describe("change-order-service - performImpactAnalysis", () => {
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
    input.affectedPartIds = ["part-1", "part-2", "part-3"];
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

  it("should return affected parts", async () => {
    const result = await performImpactAnalysis(testChangeOrderId);

    expect(result.affectedParts).toHaveLength(3);
    expect(result.whereUsedCount).toBe(3);
  });

  it("should include related change orders", async () => {
    const result = await performImpactAnalysis(testChangeOrderId);

    expect(result.relatedChangeOrders).toBeDefined();
    expect(Array.isArray(result.relatedChangeOrders)).toBe(true);
  });
});

describe("change-order-service - getProjectStatistics", () => {
  let testProjectId: string;
  let testRequesterId: string;
  let testApproverId: string;

  beforeEach(async () => {
    const [requester] = await db.insert(users).values(createMockUser({ name: "Requester" })).returning();
    const [approver] = await db.insert(users).values(createMockUser({ name: "Approver" })).returning();
    testRequesterId = requester.id;
    testApproverId = approver.id;

    const [project] = await db.insert(projects).values(createMockProject()).returning();
    testProjectId = project.id;

    // Create change orders
    const input1 = createMockChangeOrderInput(testProjectId);
    input1.type = "ECR";
    input1.approverIds = [testApproverId];
    await createChangeOrder(input1, testRequesterId);

    const input2 = createMockChangeOrderInput(testProjectId);
    input2.type = "ECN";
    input2.title = "Second CO";
    input2.approverIds = [testApproverId];
    await createChangeOrder(input2, testRequesterId);
  });

  afterEach(async () => {
    await db.delete(changeOrderAffectedParts);
    await db.delete(changeOrderAuditTrail);
    await db.delete(changeOrderApprovers);
    await db.delete(changeOrders);
    await db.delete(projects);
    await db.delete(users);
  });

  it("should return project statistics", async () => {
    const stats = await getProjectStatistics(testProjectId);

    expect(stats.total).toBe(2);
    expect(stats.byStatus.draft).toBe(2);
    expect(stats.byType.ECR).toBe(1);
    expect(stats.byType.ECN).toBe(1);
  });

  it("should return zero for empty project", async () => {
    const [emptyProject] = await db.insert(projects).values(createMockProject({ name: "Empty Project" })).returning();

    const stats = await getProjectStatistics(emptyProject.id);

    expect(stats.total).toBe(0);
    expect(stats.byStatus.draft).toBe(0);
  });
});
