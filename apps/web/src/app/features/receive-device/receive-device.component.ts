import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReceiptStatus } from '@warehouse/shared';
import { RmaApiService } from '../../core/services/rma-api.service';
import { RmaModel } from '../../core/models/rma.model';
import { ReceiptModel } from '../../core/models/receipt.model';
import { DispositionBadgeComponent } from '../../shared/components/disposition-badge/disposition-badge.component';
import { ReturnReasonPipe } from '../../shared/pipes/return-reason.pipe';

@Component({
  selector: 'app-receive-device',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatSnackBarModule,
    DispositionBadgeComponent, ReturnReasonPipe,
  ],
  templateUrl: './receive-device.component.html',
  styleUrl: './receive-device.component.scss',
})
export class ReceiveDeviceComponent implements OnInit {
  private readonly api = inject(RmaApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rma = signal<RmaModel | null>(null);
  protected readonly result = signal<ReceiptModel | null>(null);
  protected readonly submitting = signal(false);
  protected readonly loadingRma = signal(true);

  protected readonly ReceiptStatus = ReceiptStatus;

  protected readonly form = new FormGroup({
    receivedSerialNumber: new FormControl('', [Validators.required, Validators.maxLength(128)]),
    notes: new FormControl(''),
  });

  private get rmaId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.api.getRma(this.rmaId).subscribe({
      next: (rma) => { this.rma.set(rma); this.loadingRma.set(false); },
      error: () => { this.loadingRma.set(false); },
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.result.set(null);

    const { receivedSerialNumber, notes } = this.form.getRawValue();

    this.api
      .receiveDevice(this.rmaId, { receivedSerialNumber: receivedSerialNumber!, notes: notes ?? undefined })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (receipt) => this.result.set(receipt),
        error: (err) => {
          const status = err?.status;
          if (status === 422 && err?.error) {
            this.result.set(err.error as ReceiptModel);
          } else if (status === 409) {
            this.snackBar.open('Concurrent receipt attempt detected — please retry.', 'Dismiss', { duration: 5000 });
          } else {
            this.snackBar.open('An unexpected error occurred. Please try again.', 'Dismiss', { duration: 5000 });
          }
        },
      });
  }

  protected get isSuccess(): boolean {
    return this.result()?.status === ReceiptStatus.SUCCESS;
  }
}
