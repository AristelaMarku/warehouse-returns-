import { Disposition, RmaStatus } from '@warehouse/shared';
import { RmaEntity } from './entities/rma.entity';
import { mapReasonToDisposition } from './disposition.mapper';

type ValidationResult =
  | { ok: true; disposition: Disposition }
  | { ok: false; reason: string };

export function validateForReceipt(
  rma: RmaEntity,
  receivedSerial: string,
  now: Date,
): ValidationResult {
  if (rma.status !== RmaStatus.OPEN) {
    return { ok: false, reason: `RMA is already closed (status: ${rma.status})` };
  }

  if (now > rma.expiresAt) {
    return {
      ok: false,
      reason: `RMA eligibility window expired on ${rma.expiresAt.toISOString().split('T')[0]}`,
    };
  }

  if (
    rma.expectedSerialNumber !== null &&
    rma.expectedSerialNumber.trim().toUpperCase() !== receivedSerial.trim().toUpperCase()
  ) {
    return {
      ok: false,
      reason: `Serial number mismatch: expected ${rma.expectedSerialNumber}, received ${receivedSerial}`,
    };
  }

  return { ok: true, disposition: mapReasonToDisposition(rma.returnReason) };
}
