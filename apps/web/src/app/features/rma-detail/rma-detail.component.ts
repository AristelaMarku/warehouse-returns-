import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RmaApiService } from '../../core/services/rma-api.service';
import { RmaModel } from '../../core/models/rma.model';
import { ReceiptModel } from '../../core/models/receipt.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DispositionBadgeComponent } from '../../shared/components/disposition-badge/disposition-badge.component';
import { ReturnReasonPipe } from '../../shared/pipes/return-reason.pipe';
import { RmaStatus, Disposition, ReceiptStatus } from '@warehouse/shared';

@Component({
  selector: 'app-rma-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, DatePipe,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule,
    StatusBadgeComponent, DispositionBadgeComponent, ReturnReasonPipe,
  ],
  templateUrl: './rma-detail.component.html',
  styleUrl: './rma-detail.component.scss',
})
export class RmaDetailComponent implements OnInit {
  private readonly api = inject(RmaApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly rma = signal<RmaModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly receiptColumns = ['receivedAt', 'serial', 'status', 'disposition', 'rejectionReason'];

  protected readonly RmaStatus = RmaStatus;
  protected readonly ReceiptStatus = ReceiptStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getRma(id).subscribe({
      next: (rma) => { this.rma.set(rma); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected get receipts(): ReceiptModel[] {
    return (this.rma()?.receipts ?? []) as ReceiptModel[];
  }
}
