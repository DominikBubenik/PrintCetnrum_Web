import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access if user is logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
  });

  it('should deny access and navigate to login if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });
});
