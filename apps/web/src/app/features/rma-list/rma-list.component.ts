import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal, computed
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RmaStatus } from '@warehouse/shared';
import { RmaApiService } from '../../core/services/rma-api.service';
import { RmaModel } from '../../core/models/rma.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ReturnReasonPipe } from '../../shared/pipes/return-reason.pipe';

@Component({
  selector: 'app-rma-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatButtonModule, MatButtonToggleModule,
    MatProgressBarModule, MatTooltipModule,
    StatusBadgeComponent, ReturnReasonPipe, DatePipe,
    PaginatorComponent,
  ],
  templateUrl: './rma-list.component.html',
  styleUrl: './rma-list.component.scss',
})
export class RmaListComponent implements OnInit {
  private readonly api = inject(RmaApiService);
  private readonly router = inject(Router);

  protected readonly columns = ['rmaNumber', 'customerName', 'deviceModel', 'returnReason', 'status', 'expiresAt', 'actions'];
  protected readonly rmas = signal<RmaModel[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly page = signal(1);
  protected readonly limit = signal(20);
  protected readonly searchCtrl = new FormControl('');

  protected readonly RmaStatus = RmaStatus;
  protected readonly statusFilter = signal<RmaStatus | 'ACTIVE' | 'ALL'>('ACTIVE');

  protected readonly filterOptions: { label: string; value: RmaStatus | 'ACTIVE' | 'ALL' }[] = [
    { label: 'Active (Open + Expired)', value: 'ACTIVE' },
    { label: 'Open only',               value: RmaStatus.OPEN },
    { label: 'Expired only',            value: RmaStatus.EXPIRED },
    { label: 'Received',                value: RmaStatus.RECEIVED },
    { label: 'Cancelled',               value: RmaStatus.CANCELLED },
    { label: 'All',                     value: 'ALL' },
  ];

  protected isExpiringSoon(rma: RmaModel): boolean {
    const expires = new Date(rma.expiresAt);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expires <= threeDaysFromNow && rma.status === RmaStatus.OPEN;
  }

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { this.page.set(1); this.load(); });
  }

  protected onFilterChange(value: RmaStatus | 'ACTIVE' | 'ALL'): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    const filter = this.statusFilter();
    this.api
      .listRmas({
        status: filter === 'ALL' ? undefined : (filter as RmaStatus | 'ACTIVE'),
        search: this.searchCtrl.value ?? undefined,
        page: this.page(),
        limit: this.limit(),
      })
      .subscribe({
        next: (res) => {
          this.rmas.set(res.data);
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

  protected receive(rma: RmaModel): void {
    this.router.navigate(['/rmas', rma.id, 'receive']);
  }

  protected viewDetail(rma: RmaModel): void {
    this.router.navigate(['/rmas', rma.id]);
  }
}
