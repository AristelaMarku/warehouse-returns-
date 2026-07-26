import { Disposition, ReceiptStatus } from '@warehouse/shared';

export interface ReceiptModel {
  receiptId: string;
  rmaId: string;
  rmaNumber: string;
  receivedSerialNumber: string;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedAt: string;
  rma?: unknown;
}
