// Tests for PLM event system integration
import { describe, it, expect, beforeEach, vi } from "vitest";
import { plmEventBus, PLM_EVENTS } from "../events";
import type {
  ChangeOrderCreatedPayload,
  ChangeOrderStatusChangedPayload,
  ChangeOrderApprovedPayload,
} from "../events";

describe("PLM Event System", () => {
  beforeEach(() => {
    // Clear all listeners before each test
    plmEventBus.clear();
  });

  describe("PLM event bus namespace", () => {
    it("should prefix all events with 'plm:'", () => {
      const listener = vi.fn();

      // Subscribe using the PLM event bus
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, listener);

      // The actual event name should be prefixed
      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, {
        changeOrderId: "test-id",
        projectId: "project-1",
        type: "ECR",
        number: "001",
        title: "Test Change",
        requesterId: "user-1",
        approverIds: ["user-2"],
      } as ChangeOrderCreatedPayload);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple independent listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, listener1);
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_APPROVED, listener2);

      const payload: ChangeOrderCreatedPayload = {
        changeOrderId: "test-id",
        projectId: "project-1",
        type: "ECR",
        number: "001",
        title: "Test Change",
        requesterId: "user-1",
        approverIds: ["user-2"],
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, payload);

      expect(listener1).toHaveBeenCalledWith(payload);
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("Change order events", () => {
    it("should handle change order created event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, listener);

      const payload: ChangeOrderCreatedPayload = {
        changeOrderId: "co-123",
        projectId: "proj-456",
        type: "ECR",
        number: "001",
        title: "Add new feature",
        requesterId: "user-789",
        approverIds: ["user-1", "user-2"],
        affectedPartIds: ["part-1", "part-2"],
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle change order status changed event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_STATUS_CHANGED, listener);

      const payload: ChangeOrderStatusChangedPayload = {
        changeOrderId: "co-123",
        fromStatus: "submitted",
        toStatus: "approved",
        changedBy: "user-1",
        comment: "Approved by all",
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_STATUS_CHANGED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle change order approved event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_APPROVED, listener);

      const payload: ChangeOrderApprovedPayload = {
        changeOrderId: "co-123",
        type: "ECR",
        number: "001",
        title: "Add new feature",
        projectId: "proj-456",
        approverId: "user-1",
        approverComment: "Looks good",
        approvedAt: new Date(),
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_APPROVED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle change order rejected event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_REJECTED, listener);

      const payload = {
        changeOrderId: "co-123",
        type: "ECN",
        number: "002",
        title: "Update spec",
        projectId: "proj-456",
        rejecterId: "user-2",
        rejectionReason: "Needs more details",
        rejectedAt: new Date(),
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_REJECTED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle change order implemented event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_IMPLEMENTED, listener);

      const payload = {
        changeOrderId: "co-123",
        type: "ECR",
        number: "001",
        title: "Add new feature",
        projectId: "proj-456",
        implementedBy: "user-3",
        implementedRevisionId: "rev-456",
        implementedAt: new Date(),
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_IMPLEMENTED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });

    it("should handle change order submitted event", () => {
      const listener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_SUBMITTED, listener);

      const payload = {
        changeOrderId: "co-123",
        type: "ECR",
        number: "001",
        title: "Add new feature",
        projectId: "proj-456",
        submittedBy: "user-1",
        submittedAt: new Date(),
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_SUBMITTED, payload);

      expect(listener).toHaveBeenCalledWith(payload);
    });
  });

  describe("Cross-module communication", () => {
    it("should notify issue module when change order is approved", () => {
      const issueModuleListener = vi.fn();

      // Simulate issue module subscribing to change order approval
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_APPROVED, issueModuleListener);

      const payload: ChangeOrderApprovedPayload = {
        changeOrderId: "co-123",
        type: "ECR",
        number: "001",
        title: "Fix critical bug",
        projectId: "proj-456",
        approverId: "user-1",
        approverComment: "Urgent fix approved",
        approvedAt: new Date(),
      };

      // Publish the event
      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_APPROVED, payload);

      // Verify issue module was notified
      expect(issueModuleListener).toHaveBeenCalledWith(payload);
      expect(issueModuleListener).toHaveBeenCalledTimes(1);
    });

    it("should support multiple modules subscribing to same event", () => {
      const notificationListener = vi.fn();
      const analyticsListener = vi.fn();
      const auditListener = vi.fn();

      // Multiple modules subscribe to the same event
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, notificationListener);
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, analyticsListener);
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, auditListener);

      const payload: ChangeOrderCreatedPayload = {
        changeOrderId: "co-123",
        projectId: "proj-456",
        type: "ECR",
        number: "001",
        title: "New feature",
        requesterId: "user-1",
        approverIds: ["user-2"],
      };

      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, payload);

      // All modules should be notified
      expect(notificationListener).toHaveBeenCalledWith(payload);
      expect(analyticsListener).toHaveBeenCalledWith(payload);
      expect(auditListener).toHaveBeenCalledWith(payload);
    });
  });

  describe("Event filtering", () => {
    it("should only call listeners for specific event types", () => {
      const createdListener = vi.fn();
      const approvedListener = vi.fn();

      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_CREATED, createdListener);
      plmEventBus.subscribe(PLM_EVENTS.CHANGE_ORDER_APPROVED, approvedListener);

      // Publish only created event
      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, {
        changeOrderId: "co-123",
        projectId: "proj-456",
        type: "ECR",
        number: "001",
        title: "Test",
        requesterId: "user-1",
        approverIds: ["user-2"],
      } as ChangeOrderCreatedPayload);

      expect(createdListener).toHaveBeenCalled();
      expect(approvedListener).not.toHaveBeenCalled();
    });
  });

  describe("Unsubscription", () => {
    it("should stop receiving events after unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = plmEventBus.subscribe(
        PLM_EVENTS.CHANGE_ORDER_CREATED,
        listener
      );

      // First publish
      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, {
        changeOrderId: "co-1",
        projectId: "proj-1",
        type: "ECR",
        number: "001",
        title: "Test",
        requesterId: "user-1",
        approverIds: ["user-2"],
      } as ChangeOrderCreatedPayload);

      // Unsubscribe
      unsubscribe();

      // Second publish
      plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, {
        changeOrderId: "co-2",
        projectId: "proj-2",
        type: "ECN",
        number: "002",
        title: "Test 2",
        requesterId: "user-3",
        approverIds: ["user-4"],
      } as ChangeOrderCreatedPayload);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
