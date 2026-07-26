import { Disposition, ReturnReason, RmaStatus } from '@warehouse/shared';
import { ReceiptModel } from './receipt.model';

export interface RmaModel {
  id: string;
  rmaNumber: string;
  customerName: string;
  customerEmail: string | null;
  deviceModel: string;
  returnReason: ReturnReason;
  status: RmaStatus;
  disposition: Disposition | null;
  expectedSerialNumber: string | null;
  eligibilityWindowDays: number;
  expiresAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  receipts?: ReceiptModel[];
}

export interface PaginatedRmas {
  data: RmaModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
