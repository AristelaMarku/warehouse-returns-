import { Pipe, PipeTransform } from '@angular/core';
import { ReturnReason } from '@warehouse/shared';

const LABELS: Record<ReturnReason, string> = {
  [ReturnReason.STANDARD_RETURN]: 'Standard Return',
  [ReturnReason.WARRANTY_REPAIR]: 'Warranty Repair',
  [ReturnReason.TRADE_IN_RECYCLE]: 'Trade-in / Recycle',
  [ReturnReason.EXCHANGE]: 'Exchange',
};

@Pipe({ name: 'returnReason', standalone: true, pure: true })
export class ReturnReasonPipe implements PipeTransform {
  transform(value: ReturnReason): string {
    return LABELS[value] ?? value;
  }
}
