import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RmaStatus } from '@warehouse/shared';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  function setup(status: RmaStatus): HTMLElement {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it.each([
    [RmaStatus.OPEN,      'Open',      'open'],
    [RmaStatus.EXPIRED,   'Expired',   'expired'],
    [RmaStatus.RECEIVED,  'Received',  'received'],
    [RmaStatus.CANCELLED, 'Cancelled', 'cancelled'],
  ])('renders label "%s" with CSS class "%s" for status %s', (status, label, cssClass) => {
    const el = setup(status);
    const chip = el.querySelector('.status-chip') as HTMLElement;
    expect(chip.textContent?.trim()).toBe(label);
    expect(chip.classList).toContain(cssClass);
  });
});
