import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authSpy: { login: jest.Mock };
  let routerSpy: { navigate: jest.Mock };

  beforeEach(async () => {
    authSpy   = { login: jest.fn() };
    routerSpy = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router,      useValue: routerSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Form validation ───────────────────────────────────────────────────────

  it('form is invalid when both fields are empty', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('form is invalid when only username is filled', () => {
    component['form'].patchValue({ username: 'receiver1' });
    expect(component['form'].invalid).toBe(true);
  });

  it('form is invalid when only password is filled', () => {
    component['form'].patchValue({ password: 'recv123' });
    expect(component['form'].invalid).toBe(true);
  });

  it('form is valid when both fields are filled', () => {
    fillForm('receiver1', 'recv123');
    expect(component['form'].valid).toBe(true);
  });

  it('submit button is disabled when form is empty', () => {
    const btn = getSubmitButton();
    expect(btn.disabled).toBe(true);
  });

  it('submit button is enabled when both fields are filled', () => {
    fillForm('receiver1', 'recv123');
    const btn = getSubmitButton();
    expect(btn.disabled).toBe(false);
  });

  // ── Successful login ──────────────────────────────────────────────────────

  it('calls auth.login with the entered credentials', fakeAsync(() => {
    authSpy.login.mockReturnValue(of({ accessToken: 'tok', user: {} }));
    fillForm('receiver1', 'recv123');
    component['submit']();
    tick();

    expect(authSpy.login).toHaveBeenCalledWith('receiver1', 'recv123');
  }));

  it('navigates to /rmas after successful login', fakeAsync(() => {
    authSpy.login.mockReturnValue(of({ accessToken: 'tok', user: {} }));
    fillForm('receiver1', 'recv123');
    component['submit']();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/rmas']);
  }));

  it('does not show an error message after successful login', fakeAsync(() => {
    authSpy.login.mockReturnValue(of({ accessToken: 'tok', user: {} }));
    fillForm('receiver1', 'recv123');
    component['submit']();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
  }));

  // ── Failed login ──────────────────────────────────────────────────────────

  it('shows error message on failed login', fakeAsync(() => {
    authSpy.login.mockReturnValue(throwError(() => new Error('401')));
    fillForm('receiver1', 'wrongpass');
    component['submit']();
    tick();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-message') as HTMLElement;
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('Invalid username or password');
  }));

  it('re-enables the submit button after a failed login', fakeAsync(() => {
    authSpy.login.mockReturnValue(throwError(() => new Error('401')));
    fillForm('receiver1', 'wrongpass');
    component['submit']();
    tick();
    fixture.detectChanges();

    expect(component['loading']()).toBe(false);
  }));

  it('does not call auth.login when form is invalid', () => {
    component['submit']();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  // ── Page structure ────────────────────────────────────────────────────────

  it('renders the app title', () => {
    const title = fixture.nativeElement.querySelector('.login-title') as HTMLElement;
    expect(title?.textContent?.trim()).toBe('Warehouse Returns');
  });

  it('renders the subtitle', () => {
    const sub = fixture.nativeElement.querySelector('.login-subtitle') as HTMLElement;
    expect(sub?.textContent?.trim()).toBe('Sign in to continue');
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function fillForm(username: string, password: string): void {
    component['form'].setValue({ username, password });
    fixture.detectChanges();
  }

  function getSubmitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }
});
