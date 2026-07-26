import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatPaginatorModule],
  template: `
    <mat-paginator
      [length]="length()"
      [pageSize]="pageSize()"
      [pageSizeOptions]="pageSizeOptions()"
      (page)="page.emit($event)">
    </mat-paginator>
  `,
  styles: [`:host { display: block; margin-top: auto; padding-top: 8px; border-top: 1px solid #e0e0e0; }`],
})
export class PaginatorComponent {
  readonly length = input.required<number>();
  readonly pageSize = input<number>(20);
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);
  readonly page = output<PageEvent>();
}
