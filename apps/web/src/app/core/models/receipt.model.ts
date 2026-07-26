import { Disposition, ReceiptStatus } from '@warehouse/shared';

export interface ReceiptModel {
  receiptId: string;
  receivedAt: string;
  receivedSerialNumber: string;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedByDisplayName: string;
}

export interface ReceiptListItem {
  id: string;
  receivedAt: string;
  receivedSerialNumber: string;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  rmaId: string;
  rmaNumber: string;
  customerName: string;
  deviceModel: string;
  receivedByUsername: string;
  receivedByDisplayName: string;
}

export interface PaginatedReceipts {
  data: ReceiptListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
