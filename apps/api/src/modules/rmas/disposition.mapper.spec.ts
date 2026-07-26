import { Disposition, ReturnReason } from '@warehouse/shared';
import { mapReasonToDisposition } from './disposition.mapper';

describe('mapReasonToDisposition', () => {
  it.each([
    [ReturnReason.STANDARD_RETURN, Disposition.RESTOCKED],
    [ReturnReason.WARRANTY_REPAIR, Disposition.IN_EVALUATION],
    [ReturnReason.TRADE_IN_RECYCLE, Disposition.RECYCLED],
    [ReturnReason.EXCHANGE, Disposition.REPLACEMENT_ISSUED],
  ])('maps %s → %s', (reason, expected) => {
    expect(mapReasonToDisposition(reason)).toBe(expected);
  });

  it('throws on unknown reason', () => {
    expect(() => mapReasonToDisposition('UNKNOWN' as ReturnReason)).toThrow(
      'Unknown return reason: UNKNOWN',
    );
  });
});
