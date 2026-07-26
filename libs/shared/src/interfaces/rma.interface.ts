import { Disposition } from '../enums/disposition.enum';
import { ReturnReason } from '../enums/return-reason.enum';
import { RmaStatus } from '../enums/rma-status.enum';

export interface RmaResponse {
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
}
