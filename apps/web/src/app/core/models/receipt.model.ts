import { Disposition, ReceiptStatus } from '@warehouse/shared';

// Used in RMA detail receipt history (returned inside GET /rmas/:id)
export interface ReceiptModel {
  receiptId: string;
  receivedAt: string;
  receivedSerialNumber: string;
  notes: string | null;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedByDisplayName: string;
}

// One attempt row inside a grouped RMA receipt summary
export interface ReceiptAttempt {
  id: string;
  receivedAt: string;
  receivedSerialNumber: string;
  notes: string | null;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedByDisplayName: string;
}

// One row in the Received Devices list — one per RMA
export interface RmaReceiptGroup {
  rmaId: string;
  rmaNumber: string;
  customerName: string;
  deviceModel: string;
  latestStatus: ReceiptStatus;
  latestReceivedAt: string;
  attemptCount: number;
  attempts: ReceiptAttempt[];
}

export interface PaginatedRmaReceiptGroups {
  data: RmaReceiptGroup[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
