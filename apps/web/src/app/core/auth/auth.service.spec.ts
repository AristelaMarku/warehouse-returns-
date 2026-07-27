import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService, UserProfile } from './auth.service';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'warehouse_access_token';

const mockUser: UserProfile = {
  id: 'user-1',
  username: 'receiver1',
  displayName: 'Bob Receiver',
  email: 'bob@test.com',
  role: 'receiver',
};

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: jest.Mock };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service  = TestBed.inject(AuthService);
    // No token in localStorage → constructor makes no /me call
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('isLoggedIn() is false on a clean start', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('currentUser() is null on a clean start', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('getToken() returns null when nothing is stored', () => {
    expect(service.getToken()).toBeNull();
  });

  describe('login()', () => {
    it('POSTs credentials to /auth/login', fakeAsync(() => {
      service.login('receiver1', 'recv123').subscribe();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'receiver1', password: 'recv123' });
      req.flush({ accessToken: 'tok', user: mockUser });
      tick();
    }));

    it('stores the access token in localStorage', fakeAsync(() => {
      service.login('receiver1', 'recv123').subscribe();
      httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`)
        .flush({ accessToken: 'my-token', user: mockUser });
      tick();

      expect(localStorage.getItem(TOKEN_KEY)).toBe('my-token');
      expect(service.getToken()).toBe('my-token');
    }));

    it('sets currentUser after successful login', fakeAsync(() => {
      service.login('receiver1', 'recv123').subscribe();
      httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`)
        .flush({ accessToken: 'tok', user: mockUser });
      tick();

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    }));
  });

  describe('logout()', () => {
    beforeEach(fakeAsync(() => {
      service.login('receiver1', 'recv123').subscribe();
      httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`)
        .flush({ accessToken: 'tok', user: mockUser });
      tick();
    }));

    it('removes the token from localStorage', () => {
      service.logout();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('clears currentUser', () => {
      service.logout();
      expect(service.currentUser()).toBeNull();
    });

    it('sets isLoggedIn to false', () => {
      service.logout();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('navigates to /login', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('constructor — /me call', () => {
    it('fetches /me and updates currentUser when a valid token is present', fakeAsync(() => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem(TOKEN_KEY, makeJwt({ sub: 'u1', username: 'receiver1', role: 'receiver', exp }));

      // Re-create service so constructor runs with the token in place
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [{ provide: Router, useValue: routerSpy }],
      });
      httpMock = TestBed.inject(HttpTestingController);
      const svc = TestBed.inject(AuthService);

      const meReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      meReq.flush(mockUser);
      tick();

      expect(svc.currentUser()).toEqual(mockUser);
    }));
  });
});
