import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth-services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getRoleFromToken']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access if user is logged in and role is Admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getRoleFromToken.and.returnValue('Admin');

    expect(guard.canActivate()).toBeTrue();
  });

  it('should deny access and navigate to login if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    authServiceSpy.getRoleFromToken.and.returnValue('');

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should deny access and navigate to login if user is not an Admin', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getRoleFromToken.and.returnValue('User');

    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });
});
