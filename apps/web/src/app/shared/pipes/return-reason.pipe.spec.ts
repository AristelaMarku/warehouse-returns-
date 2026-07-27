import { ReturnReason } from '@warehouse/shared';
import { ReturnReasonPipe } from './return-reason.pipe';

describe('ReturnReasonPipe', () => {
  const pipe = new ReturnReasonPipe();

  it.each([
    [ReturnReason.STANDARD_RETURN,  'Standard Return'],
    [ReturnReason.WARRANTY_REPAIR,  'Warranty Repair'],
    [ReturnReason.TRADE_IN_RECYCLE, 'Trade-in / Recycle'],
    [ReturnReason.EXCHANGE,         'Exchange'],
  ])('transforms %s → "%s"', (reason, expected) => {
    expect(pipe.transform(reason)).toBe(expected);
  });

  it('returns the raw value for an unknown reason', () => {
    expect(pipe.transform('UNKNOWN' as ReturnReason)).toBe('UNKNOWN');
  });
});
