import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Disposition } from '@warehouse/shared';
import { DispositionBadgeComponent } from './disposition-badge.component';

describe('DispositionBadgeComponent', () => {
  let fixture: ComponentFixture<DispositionBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispositionBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DispositionBadgeComponent);
  });

  function setup(disposition: Disposition): HTMLElement {
    fixture.componentRef.setInput('disposition', disposition);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it.each([
    [Disposition.RESTOCKED,           'Restocked',           'restocked'],
    [Disposition.IN_EVALUATION,       'In Evaluation',       'in-evaluation'],
    [Disposition.RECYCLED,            'Recycled',            'recycled'],
    [Disposition.REPLACEMENT_ISSUED,  'Replacement Issued',  'replacement-issued'],
  ])('%s → label "%s" with CSS class "%s"', (disposition, expectedLabel, expectedClass) => {
    const el   = setup(disposition);
    const chip = el.querySelector('.disposition-chip') as HTMLElement;
    expect(chip.textContent?.trim()).toBe(expectedLabel);
    expect(chip.classList).toContain(expectedClass);
  });
});
