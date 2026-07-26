import { Disposition, ReturnReason } from '@warehouse/shared';

const REASON_TO_DISPOSITION: Record<ReturnReason, Disposition> = {
  [ReturnReason.STANDARD_RETURN]: Disposition.RESTOCKED,
  [ReturnReason.WARRANTY_REPAIR]: Disposition.IN_EVALUATION,
  [ReturnReason.TRADE_IN_RECYCLE]: Disposition.RECYCLED,
  [ReturnReason.EXCHANGE]: Disposition.REPLACEMENT_ISSUED,
};

export function mapReasonToDisposition(reason: ReturnReason): Disposition {
  const disposition = REASON_TO_DISPOSITION[reason];
  if (!disposition) {
    throw new Error(`Unknown return reason: ${reason}`);
  }
  return disposition;
}
