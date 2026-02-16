// PLM module - Change Request (ECR/ECN)
// Placeholder for change request implementation

export type ChangeOrderType = 'ECR' | 'ECN'; // Engineering Change Request/Notice
export type ChangeOrderStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'implemented';

export interface ChangeOrder {
  id: string;
  type: ChangeOrderType;
  title: string;
  description: string;
  reason: string;
  status: ChangeOrderStatus;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeOrderApproval {
  id: string;
  changeOrderId: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  reviewedAt: Date | null;
}
