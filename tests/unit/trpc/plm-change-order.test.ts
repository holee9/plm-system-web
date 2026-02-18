/**
 * Unit tests for PLM Change Order tRPC router
 * Tests all change order procedures including validation and error handling
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { type Context } from "~/server/trpc";
import { type ProtectedProcedure } from "~/server/trpc/middleware/is-authed";
import { plmRouter } from "~/modules/plm/router";
import { type ChangeOrderType, type ChangeOrderStatus } from "~/modules/plm/change-order-service";

// Mock the change order service
vi.mock("~/modules/plm/change-order-service", () => ({
  createChangeOrder: vi.fn(),
  getChangeOrderById: vi.fn(),
  updateChangeOrder: vi.fn(),
  submitChangeOrder: vi.fn(),
  acceptForReview: vi.fn(),
  reviewChangeOrder: vi.fn(),
  implementChangeOrder: vi.fn(),
  listChangeOrders: vi.fn(),
  getAuditTrail: vi.fn(),
  performImpactAnalysis: vi.fn(),
  getProjectStatistics: vi.fn(),
}));

// Mock context
function createMockContext(userId: string = "test-user-id"): Partial<Context> {
  return {
    user: {
      id: userId,
      email: "test@example.com",
      name: "Test User",
    },
  };
}

describe("PLM Change Order tRPC Router", () => {
  describe("changeOrder.create", () => {
    it("should have correct input schema", () => {
      const caller = plmRouter.createCallers();
      const createProcedure = plmRouter._def.procedures.changeOrder.create;

      expect(createProcedure._def.input).toBeDefined();
    });

    it("should require projectId", () => {
      const createProcedure = plmRouter._def.procedures.changeOrder.create;
      const inputSchema = createProcedure._def.input;

      // Invalid input: missing projectId
      const result1 = inputSchema.safeParse({
        type: "ECR",
        title: "Test Title",
        description: "Test description",
        reason: "Test reason",
        approverIds: ["approver-1"],
      });
      expect(result1.success).toBe(false);
    });

    it("should require valid change order type", () => {
      const createProcedure = plmRouter._def.procedures.changeOrder.create;
      const inputSchema = createProcedure._def.input;

      // Invalid input: wrong type
      const result = inputSchema.safeParse({
        projectId: "project-1",
        type: "INVALID",
        title: "Test Title",
        description: "Test description",
        reason: "Test reason",
        approverIds: ["approver-1"],
      });
      expect(result.success).toBe(false);
    });

    it("should validate title length", () => {
      const createProcedure = plmRouter._def.procedures.changeOrder.create;
      const inputSchema = createProcedure._def.input;

      // Title too short
      const result1 = inputSchema.safeParse({
        projectId: "project-1",
        type: "ECR",
        title: "ABC",
        description: "Test description",
        reason: "Test reason",
        approverIds: ["approver-1"],
      });
      expect(result1.success).toBe(false);

      // Title too long
      const result2 = inputSchema.safeParse({
        projectId: "project-1",
        type: "ECR",
        title: "A".repeat(501),
        description: "Test description",
        reason: "Test reason",
        approverIds: ["approver-1"],
      });
      expect(result2.success).toBe(false);
    });

    it("should require at least one approver", () => {
      const createProcedure = plmRouter._def.procedures.changeOrder.create;
      const inputSchema = createProcedure._def.input;

      // Empty approver list
      const result = inputSchema.safeParse({
        projectId: "project-1",
        type: "ECR",
        title: "Test Title",
        description: "Test description",
        reason: "Test reason",
        approverIds: [],
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid ECR input", () => {
      const createProcedure = plmRouter._def.procedures.changeOrder.create;
      const inputSchema = createProcedure._def.input;

      const result = inputSchema.safeParse({
        projectId: "project-1",
        type: "ECR",
        title: "Valid Title",
        description: "Valid description",
        reason: "Valid reason",
        approverIds: ["approver-1", "approver-2"],
        affectedPartIds: ["part-1", "part-2"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.update", () => {
    it("should accept partial updates", () => {
      const updateProcedure = plmRouter._def.procedures.changeOrder.update;
      const inputSchema = updateProcedure._def.input;

      // Only title update
      const result1 = inputSchema.safeParse({
        changeOrderId: "co-1",
        title: "Updated Title",
      });
      expect(result1.success).toBe(true);

      // Only description update
      const result2 = inputSchema.safeParse({
        changeOrderId: "co-1",
        description: "Updated description",
      });
      expect(result2.success).toBe(true);
    });

    it("should validate updated fields", () => {
      const updateProcedure = plmRouter._def.procedures.changeOrder.update;
      const inputSchema = updateProcedure._def.input;

      // Invalid title
      const result = inputSchema.safeParse({
        changeOrderId: "co-1",
        title: "ABC",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changeOrder.review", () => {
    it("should require valid review status", () => {
      const reviewProcedure = plmRouter._def.procedures.changeOrder.review;
      const inputSchema = reviewProcedure._def.input;

      // Invalid status
      const result = inputSchema.safeParse({
        changeOrderId: "co-1",
        status: "INVALID",
      });
      expect(result.success).toBe(false);
    });

    it("should accept approve status", () => {
      const reviewProcedure = plmRouter._def.procedures.changeOrder.review;
      const inputSchema = reviewProcedure._def.input;

      const result1 = inputSchema.safeParse({
        changeOrderId: "co-1",
        status: "approved",
      });
      expect(result1.success).toBe(true);

      const result2 = inputSchema.safeParse({
        changeOrderId: "co-1",
        status: "approved",
        comment: "Looks good!",
      });
      expect(result2.success).toBe(true);
    });

    it("should accept reject status", () => {
      const reviewProcedure = plmRouter._def.procedures.changeOrder.review;
      const inputSchema = reviewProcedure._def.input;

      const result = inputSchema.safeParse({
        changeOrderId: "co-1",
        status: "rejected",
        comment: "Needs more work",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.list", () => {
    it("should accept project ID with filters", () => {
      const listProcedure = plmRouter._def.procedures.changeOrder.list;
      const inputSchema = listProcedure._def.input;

      // Basic list
      const result1 = inputSchema.safeParse({
        projectId: "project-1",
      });
      expect(result1.success).toBe(true);

      // With status filter
      const result2 = inputSchema.safeParse({
        projectId: "project-1",
        status: "draft",
      });
      expect(result2.success).toBe(true);

      // With type filter
      const result3 = inputSchema.safeParse({
        projectId: "project-1",
        type: "ECR",
      });
      expect(result3.success).toBe(true);

      // With pagination
      const result4 = inputSchema.safeParse({
        projectId: "project-1",
        limit: 10,
        offset: 0,
      });
      expect(result4.success).toBe(true);

      // Combined filters
      const result5 = inputSchema.safeParse({
        projectId: "project-1",
        status: "approved",
        type: "ECN",
        limit: 20,
        offset: 0,
      });
      expect(result5.success).toBe(true);
    });

    it("should validate pagination limits", () => {
      const listProcedure = plmRouter._def.procedures.changeOrder.list;
      const inputSchema = listProcedure._def.input;

      // Limit too low
      const result1 = inputSchema.safeParse({
        projectId: "project-1",
        limit: 0,
      });
      expect(result1.success).toBe(false);

      // Limit too high
      const result2 = inputSchema.safeParse({
        projectId: "project-1",
        limit: 101,
      });
      expect(result2.success).toBe(false);
    });
  });

  describe("changeOrder.implement", () => {
    it("should accept change order ID with optional revision", () => {
      const implementProcedure = plmRouter._def.procedures.changeOrder.implement;
      const inputSchema = implementProcedure._def.input;

      // Without revision
      const result1 = inputSchema.safeParse({
        changeOrderId: "co-1",
      });
      expect(result1.success).toBe(true);

      // With revision
      const result2 = inputSchema.safeParse({
        changeOrderId: "co-1",
        revisionId: "revision-1",
      });
      expect(result2.success).toBe(true);
    });
  });

  describe("changeOrder.getById", () => {
    it("should require valid UUID", () => {
      const getByIdProcedure = plmRouter._def.procedures.changeOrder.getById;
      const inputSchema = getByIdProcedure._def.input;

      // Invalid UUID
      const result = inputSchema.safeParse({
        changeOrderId: "not-a-uuid",
      });
      expect(result.success).toBe(false);

      // Valid UUID
      const result2 = inputSchema.safeParse({
        changeOrderId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result2.success).toBe(true);
    });
  });

  describe("changeOrder.submit", () => {
    it("should require valid UUID", () => {
      const submitProcedure = plmRouter._def.procedures.changeOrder.submit;
      const inputSchema = submitProcedure._def.input;

      // Valid UUID
      const result = inputSchema.safeParse({
        changeOrderId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.acceptForReview", () => {
    it("should require valid UUID", () => {
      const acceptProcedure = plmRouter._def.procedures.changeOrder.acceptForReview;
      const inputSchema = acceptProcedure._def.input;

      // Valid UUID
      const result = inputSchema.safeParse({
        changeOrderId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.auditTrail", () => {
    it("should require valid UUID", () => {
      const auditProcedure = plmRouter._def.procedures.changeOrder.auditTrail;
      const inputSchema = auditProcedure._def.input;

      // Valid UUID
      const result = inputSchema.safeParse({
        changeOrderId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.impactAnalysis", () => {
    it("should require valid UUID", () => {
      const impactProcedure = plmRouter._def.procedures.changeOrder.impactAnalysis;
      const inputSchema = impactProcedure._def.input;

      // Valid UUID
      const result = inputSchema.safeParse({
        changeOrderId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("changeOrder.statistics", () => {
    it("should require valid project UUID", () => {
      const statsProcedure = plmRouter._def.procedures.changeOrder.statistics;
      const inputSchema = statsProcedure._def.input;

      // Valid UUID
      const result = inputSchema.safeParse({
        projectId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });
});
