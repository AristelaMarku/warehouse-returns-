import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

function runGuard(): boolean | unknown {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
}

describe('authGuard', () => {
  let routerSpy: { navigate: jest.Mock };

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() };
  });

  describe('when the user IS logged in', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: Router,      useValue: routerSpy },
          { provide: AuthService, useValue: { isLoggedIn: () => true } },
        ],
      });
    });

    it('returns true', () => {
      expect(runGuard()).toBe(true);
    });

    it('does not redirect', () => {
      runGuard();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('when the user is NOT logged in', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: Router,      useValue: routerSpy },
          { provide: AuthService, useValue: { isLoggedIn: () => false } },
        ],
      });
    });

    it('returns false', () => {
      expect(runGuard()).toBe(false);
    });

    it('redirects to /login', () => {
      runGuard();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
