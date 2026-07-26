import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ReceiptStatus } from '@warehouse/shared';
import { RmaApiService } from '../../core/services/rma-api.service';
import { ReceiptListItem } from '../../core/models/receipt.model';
import { DispositionBadgeComponent } from '../../shared/components/disposition-badge/disposition-badge.component';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, NgClass,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatSelectModule, MatProgressBarModule, MatButtonModule, MatIconModule,
    DispositionBadgeComponent,
  ],
  templateUrl: './receipts-list.component.html',
  styleUrl: './receipts-list.component.scss',
})
export class ReceiptsListComponent implements OnInit {
  private readonly api = inject(RmaApiService);
  private readonly router = inject(Router);

  protected readonly columns = [
    'receivedAt', 'rmaNumber', 'customerName', 'deviceModel',
    'receivedSerialNumber', 'status', 'disposition', 'receivedBy',
  ];
  protected readonly receipts = signal<ReceiptListItem[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly page = signal(1);
  protected readonly limit = signal(20);
  protected statusFilter: ReceiptStatus | '' = '';
  protected readonly ReceiptStatus = ReceiptStatus;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api
      .listReceipts(this.page(), this.limit(), this.statusFilter || undefined)
      .subscribe({
        next: (res) => {
          this.receipts.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.load();
  }

  protected onStatusChange(): void {
    this.page.set(1);
    this.load();
  }

  protected viewRma(rmaId: string): void {
    this.router.navigate(['/rmas', rmaId]);
  }
}
