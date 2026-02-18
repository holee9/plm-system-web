/**
 * PLM Event Definitions
 *
 * Type-safe event definitions for the PLM module.
 * Defines events for change orders, parts, revisions, BOM, and more.
 */

import type { EventPayload, EventName } from "~/lib/event-bus";
import type {
  ChangeOrderStatus,
  ChangeOrderType,
} from "./change-order-service";

// ============================================================================
// Change Order Events
// ============================================================================

/**
 * Payload for change order created event
 */
export interface ChangeOrderCreatedPayload {
  changeOrderId: string;
  projectId: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  requesterId: string;
  approverIds: string[];
  affectedPartIds?: string[];
}

/**
 * Payload for change order status changed event
 */
export interface ChangeOrderStatusChangedPayload {
  changeOrderId: string;
  fromStatus: ChangeOrderStatus;
  toStatus: ChangeOrderStatus;
  changedBy: string;
  comment?: string;
}

/**
 * Payload for change order approved event
 */
export interface ChangeOrderApprovedPayload {
  changeOrderId: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  projectId: string;
  approverId: string;
  approverComment?: string;
  approvedAt: Date;
}

/**
 * Payload for change order rejected event
 */
export interface ChangeOrderRejectedPayload {
  changeOrderId: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  projectId: string;
  rejecterId: string;
  rejectionReason?: string;
  rejectedAt: Date;
}

/**
 * Payload for change order implemented event
 */
export interface ChangeOrderImplementedPayload {
  changeOrderId: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  projectId: string;
  implementedBy: string;
  implementedRevisionId?: string;
  implementedAt: Date;
}

/**
 * Payload for change order submitted event
 */
export interface ChangeOrderSubmittedPayload {
  changeOrderId: string;
  type: ChangeOrderType;
  number: string;
  title: string;
  projectId: string;
  submittedBy: string;
  submittedAt: Date;
}

// ============================================================================
// Part Events
// ============================================================================

/**
 * Payload for part created event
 */
export interface PartCreatedPayload {
  partId: string;
  partNumber: string;
  name: string;
  projectId: string;
  createdBy: string;
  category?: string;
}

/**
 * Payload for part updated event
 */
export interface PartUpdatedPayload {
  partId: string;
  partNumber: string;
  name: string;
  projectId: string;
  updatedBy: string;
  revisionId?: string;
  changeDescription?: string;
}

/**
 * Payload for part deleted event
 */
export interface PartDeletedPayload {
  partId: string;
  partNumber: string;
  projectId: string;
  deletedBy: string;
}

// ============================================================================
// BOM Events
// ============================================================================

/**
 * Payload for BOM item added event
 */
export interface BomItemAddedPayload {
  bomItemId: string;
  parentPartId: string;
  childPartId: string;
  quantity: string;
  addedBy: string;
}

/**
 * Payload for BOM item updated event
 */
export interface BomItemUpdatedPayload {
  bomItemId: string;
  parentPartId: string;
  childPartId: string;
  updatedBy: string;
  changes: {
    quantity?: { from: string; to: string };
    unit?: { from: string; to: string };
    position?: { from: number; to: number };
  };
}

/**
 * Payload for BOM item removed event
 */
export interface BomItemRemovedPayload {
  bomItemId: string;
  parentPartId: string;
  childPartId: string;
  removedBy: string;
}

// ============================================================================
// Revision Events
// ============================================================================

/**
 * Payload for revision created event
 */
export interface RevisionCreatedPayload {
  revisionId: string;
  partId: string;
  partNumber: string;
  revisionNumber: string;
  createdBy: string;
  changeDescription?: string;
}

// ============================================================================
// Event Name Constants
// ============================================================================

/**
 * PLM event names
 * Use these constants to ensure type safety and avoid typos
 */
export const PLM_EVENTS = {
  // Change order events
  CHANGE_ORDER_CREATED: "changeOrder.created",
  CHANGE_ORDER_STATUS_CHANGED: "changeOrder.statusChanged",
  CHANGE_ORDER_SUBMITTED: "changeOrder.submitted",
  CHANGE_ORDER_APPROVED: "changeOrder.approved",
  CHANGE_ORDER_REJECTED: "changeOrder.rejected",
  CHANGE_ORDER_IMPLEMENTED: "changeOrder.implemented",

  // Part events
  PART_CREATED: "part.created",
  PART_UPDATED: "part.updated",
  PART_DELETED: "part.deleted",

  // BOM events
  BOM_ITEM_ADDED: "bom.itemAdded",
  BOM_ITEM_UPDATED: "bom.itemUpdated",
  BOM_ITEM_REMOVED: "bom.itemRemoved",

  // Revision events
  REVISION_CREATED: "revision.created",
} as const;

// Type for PLM event names
export type PlmEventName = (typeof PLM_EVENTS)[keyof typeof PLM_EVENTS];

// ============================================================================
// PLM Event Bus
// ============================================================================

import { createNamespacedEventBus, type EventBus } from "~/lib/event-bus";

/**
 * PLM-specific event bus with namespaced events
 * All events are prefixed with "plm:"
 */
export const plmEventBus: EventBus = createNamespacedEventBus("plm");

// ============================================================================
// Event Publisher Helper Functions
// ============================================================================

/**
 * Publish change order created event
 */
export function publishChangeOrderCreated(
  payload: ChangeOrderCreatedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_CREATED, payload);
}

/**
 * Publish change order status changed event
 */
export function publishChangeOrderStatusChanged(
  payload: ChangeOrderStatusChangedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_STATUS_CHANGED, payload);
}

/**
 * Publish change order submitted event
 */
export function publishChangeOrderSubmitted(
  payload: ChangeOrderSubmittedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_SUBMITTED, payload);
}

/**
 * Publish change order approved event
 */
export function publishChangeOrderApproved(
  payload: ChangeOrderApprovedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_APPROVED, payload);
}

/**
 * Publish change order rejected event
 */
export function publishChangeOrderRejected(
  payload: ChangeOrderRejectedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_REJECTED, payload);
}

/**
 * Publish change order implemented event
 */
export function publishChangeOrderImplemented(
  payload: ChangeOrderImplementedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.CHANGE_ORDER_IMPLEMENTED, payload);
}

/**
 * Publish part created event
 */
export function publishPartCreated(payload: PartCreatedPayload): void {
  plmEventBus.publish(PLM_EVENTS.PART_CREATED, payload);
}

/**
 * Publish part updated event
 */
export function publishPartUpdated(payload: PartUpdatedPayload): void {
  plmEventBus.publish(PLM_EVENTS.PART_UPDATED, payload);
}

/**
 * Publish part deleted event
 */
export function publishPartDeleted(payload: PartDeletedPayload): void {
  plmEventBus.publish(PLM_EVENTS.PART_DELETED, payload);
}

/**
 * Publish BOM item added event
 */
export function publishBomItemAdded(payload: BomItemAddedPayload): void {
  plmEventBus.publish(PLM_EVENTS.BOM_ITEM_ADDED, payload);
}

/**
 * Publish BOM item updated event
 */
export function publishBomItemUpdated(payload: BomItemUpdatedPayload): void {
  plmEventBus.publish(PLM_EVENTS.BOM_ITEM_UPDATED, payload);
}

/**
 * Publish BOM item removed event
 */
export function publishBomItemRemoved(payload: BomItemRemovedPayload): void {
  plmEventBus.publish(PLM_EVENTS.BOM_ITEM_REMOVED, payload);
}

/**
 * Publish revision created event
 */
export function publishRevisionCreated(
  payload: RevisionCreatedPayload
): void {
  plmEventBus.publish(PLM_EVENTS.REVISION_CREATED, payload);
}
