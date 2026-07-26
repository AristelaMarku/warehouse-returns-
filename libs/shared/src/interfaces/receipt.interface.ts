import { Disposition } from '../enums/disposition.enum';
import { ReceiptStatus } from '../enums/receipt-status.enum';

export interface ReceiptResponse {
  receiptId: string;
  rmaId: string;
  rmaNumber: string;
  receivedSerialNumber: string;
  status: ReceiptStatus;
  disposition: Disposition | null;
  rejectionReason: string | null;
  receivedAt: string;
  receivedBy: { id: string; displayName: string };
}
