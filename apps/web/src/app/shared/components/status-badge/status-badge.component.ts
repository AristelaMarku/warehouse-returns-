import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RmaStatus } from '@warehouse/shared';

const LABEL: Record<RmaStatus, string> = {
  [RmaStatus.OPEN]: 'Open',
  [RmaStatus.RECEIVED]: 'Received',
  [RmaStatus.CANCELLED]: 'Cancelled',
  [RmaStatus.EXPIRED]: 'Expired',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <span class="status-chip" [ngClass]="status().toLowerCase()">
      {{ label() }}
    </span>
  `,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<RmaStatus>();
  readonly label = () => LABEL[this.status()] ?? this.status();
}
