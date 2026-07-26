import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Disposition } from '@warehouse/shared';

const LABEL: Record<Disposition, string> = {
  [Disposition.RESTOCKED]: 'Restocked',
  [Disposition.IN_EVALUATION]: 'In Evaluation',
  [Disposition.RECYCLED]: 'Recycled',
  [Disposition.REPLACEMENT_ISSUED]: 'Replacement Issued',
};

const CSS_CLASS: Record<Disposition, string> = {
  [Disposition.RESTOCKED]: 'restocked',
  [Disposition.IN_EVALUATION]: 'in-evaluation',
  [Disposition.RECYCLED]: 'recycled',
  [Disposition.REPLACEMENT_ISSUED]: 'replacement-issued',
};

@Component({
  selector: 'app-disposition-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <span class="disposition-chip" [ngClass]="cssClass()">
      {{ label() }}
    </span>
  `,
  styleUrl: './disposition-badge.component.scss',
})
export class DispositionBadgeComponent {
  readonly disposition = input.required<Disposition>();
  readonly label = () => LABEL[this.disposition()] ?? this.disposition();
  readonly cssClass = () => CSS_CLASS[this.disposition()] ?? '';
}
