import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpRequest
} from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from '../services/auth-services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TokenApiModel } from '../models/user-models/token-api.model';

describe('TokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'getToken',
      'getRefreshToken',
      'renewToken',
      'storeToken',
      'storeRefreshToken'
    ]);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: Router, useValue: routeSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token is present', () => {
    authServiceSpy.getToken.and.returnValue('test-token');

    http.get('/dummy').subscribe();

    const req = httpMock.expectOne('/dummy');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should NOT add Authorization header if token is not present', () => {
    authServiceSpy.getToken.and.returnValue(null);

    http.get('/dummy').subscribe();

    const req = httpMock.expectOne('/dummy');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should handle 401 error and refresh token', () => {
    const tokenModel: TokenApiModel = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };

    authServiceSpy.getToken.and.returnValue('expired-token');
    authServiceSpy.getRefreshToken.and.returnValue('refresh-token');
    authServiceSpy.renewToken.and.returnValue(of(tokenModel));

    http.get('/protected').subscribe();

    const req = httpMock.expectOne('/protected');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Token is expired, Please Login again',
      'Close',
      { duration: 5000, panelClass: ['warning-snackbar'] }
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should navigate to login if refresh token also fails', () => {
    authServiceSpy.getToken.and.returnValue('expired-token');
    authServiceSpy.getRefreshToken.and.returnValue('refresh-token');
    authServiceSpy.renewToken.and.returnValue(throwError(() => new Error('Refresh failed')));

    http.get('/another').subscribe({
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
      }
    });

    const req = httpMock.expectOne('/another');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});
