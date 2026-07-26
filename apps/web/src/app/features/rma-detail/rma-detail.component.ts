import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RmaApiService } from '../../core/services/rma-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { RmaModel } from '../../core/models/rma.model';
import { ReceiptModel } from '../../core/models/receipt.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DispositionBadgeComponent } from '../../shared/components/disposition-badge/disposition-badge.component';
import { ReturnReasonPipe } from '../../shared/pipes/return-reason.pipe';
import { RmaStatus, ReceiptStatus } from '@warehouse/shared';

@Component({
  selector: 'app-rma-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, DatePipe, FormsModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    StatusBadgeComponent, DispositionBadgeComponent, ReturnReasonPipe,
  ],
  templateUrl: './rma-detail.component.html',
  styleUrl: './rma-detail.component.scss',
})
export class RmaDetailComponent implements OnInit {
  private readonly api = inject(RmaApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly rma = signal<RmaModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly receiptColumns = ['receivedAt', 'serial', 'status', 'disposition', 'rejectionReason', 'receivedBy'];

  protected readonly RmaStatus = RmaStatus;
  protected readonly ReceiptStatus = ReceiptStatus;

  protected readonly isSupervisor = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'supervisor' || role === 'admin';
  });

  // Extend window form state
  protected readonly showExtendForm = signal(false);
  protected readonly extending = signal(false);
  protected extendDays = signal(7);

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

  protected confirmExtend(): void {
    const days = this.extendDays();
    if (!days || days < 1) return;
    this.extending.set(true);
    this.api.extendWindow(this.rma()!.id, days).subscribe({
      next: (rma) => {
        this.rma.set(rma);
        this.showExtendForm.set(false);
        this.extending.set(false);
      },
      error: () => this.extending.set(false),
    });
  }
}
