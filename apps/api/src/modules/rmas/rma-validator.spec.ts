import { Disposition, ReturnReason, RmaStatus } from '@warehouse/shared';
import { RmaEntity } from './entities/rma.entity';
import { validateForReceipt } from './rma-validator';

function makeRma(overrides: Partial<RmaEntity> = {}): RmaEntity {
  const rma = new RmaEntity();
  rma.id = 'uuid-001';
  rma.rmaNumber = 'RMA-TEST-001';
  rma.returnReason = ReturnReason.STANDARD_RETURN;
  rma.status = RmaStatus.OPEN;
  rma.eligibilityWindowDays = 30;
  rma.expectedSerialNumber = null;
  rma.createdAt = new Date('2024-08-01T00:00:00Z');
  Object.assign(rma, overrides);
  return rma;
}

const NOW_IN_WINDOW = new Date('2024-08-15T00:00:00Z');
const NOW_EXPIRED = new Date('2024-09-15T00:00:00Z');

describe('validateForReceipt', () => {
  it('returns ok=true with correct disposition for STANDARD_RETURN', () => {
    const result = validateForReceipt(makeRma(), 'ANYSERIAL', NOW_IN_WINDOW);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.disposition).toBe(Disposition.RESTOCKED);
  });

  it('returns ok=true for WARRANTY_REPAIR with correct serial', () => {
    const rma = makeRma({ returnReason: ReturnReason.WARRANTY_REPAIR, expectedSerialNumber: 'ABC123' });
    const result = validateForReceipt(rma, 'ABC123', NOW_IN_WINDOW);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.disposition).toBe(Disposition.IN_EVALUATION);
  });

  it('rejects when status is not OPEN', () => {
    const rma = makeRma({ status: RmaStatus.RECEIVED });
    const result = validateForReceipt(rma, 'ANY', NOW_IN_WINDOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('already closed');
  });

  it('rejects when eligibility window has expired', () => {
    const result = validateForReceipt(makeRma(), 'ANY', NOW_EXPIRED);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('expired');
  });

  it('rejects on serial mismatch', () => {
    const rma = makeRma({ expectedSerialNumber: 'EXPECTED123' });
    const result = validateForReceipt(rma, 'WRONGSERIAL', NOW_IN_WINDOW);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('EXPECTED123');
      expect(result.reason).toContain('WRONGSERIAL');
    }
  });

  it('passes when expectedSerialNumber is null (any serial accepted)', () => {
    const rma = makeRma({ expectedSerialNumber: null });
    const result = validateForReceipt(rma, 'ANYSERIAL', NOW_IN_WINDOW);
    expect(result.ok).toBe(true);
  });

  it('is case-insensitive on serial comparison', () => {
    const rma = makeRma({ expectedSerialNumber: 'abc123' });
    const result = validateForReceipt(rma, 'ABC123', NOW_IN_WINDOW);
    expect(result.ok).toBe(true);
  });

  it('rejects when status is CANCELLED', () => {
    const rma = makeRma({ status: RmaStatus.CANCELLED });
    const result = validateForReceipt(rma, 'ANY', NOW_IN_WINDOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('CANCELLED');
  });
});
