import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserStoreService } from './user-store.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenApiModel } from '../../models/user-models/token-api.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userStoreServiceSpy: jasmine.SpyObj<UserStoreService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get', 'put']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const userStoreSpyObj = jasmine.createSpyObj('UserStoreService', ['getFullNameFromStore']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: UserStoreService, useValue: userStoreSpyObj },
        JwtHelperService,
      ]
    });
    service = TestBed.inject(AuthService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    userStoreServiceSpy = TestBed.inject(UserStoreService) as jasmine.SpyObj<UserStoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call loginUser and return the response', () => {
    const mockResponse = { token: 'dummy-token' };
    const user = { username: 'test', password: 'password' };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    service.loginUser(user).subscribe(response => {
      expect(response.token).toBe('dummy-token');
    });

    expect(httpClientSpy.post).toHaveBeenCalledWith('https://localhost:7074/api/User/authenticate', user);
  });

  it('should store the token in local storage when storeToken is called', () => {
    const token = 'dummy-token';
    spyOn(localStorage, 'setItem');

    service.storeToken(token);

    expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
  });

  it('should return the stored token from localStorage when getToken is called', () => {
    spyOn(localStorage, 'getItem').and.returnValue('dummy-token');

    const token = service.getToken();

    expect(token).toBe('dummy-token');
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('should return false for isLoggedIn if there is no token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const isLoggedIn = service.isLoggedIn();

    expect(isLoggedIn).toBeFalse();
  });

  it('should return true for isLoggedIn if there is a token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('dummy-token');

    const isLoggedIn = service.isLoggedIn();

    expect(isLoggedIn).toBeTrue();
  });

  it('should clear localStorage and navigate to login when logOut is called', () => {
    spyOn(localStorage, 'clear');

    service.logOut();

    expect(localStorage.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should decode the token using JwtHelperService', () => {
    const mockDecodedToken = { role: 'Admin', unique_name: 'testUser' };
    spyOn(JwtHelperService.prototype, 'decodeToken').and.returnValue(mockDecodedToken);

    const decodedToken = service.decodedToken();

    expect(decodedToken).toEqual(mockDecodedToken);
  });

  it('should return the full name from the token or user store', () => {
    userStoreServiceSpy.getFullNameFromStore.and.returnValue('John Doe');
    const fullName = service.getfullNameFromToken();

    expect(fullName).toBe('John Doe');
  });

  it('should call the renewToken method and return the response', () => {
    const mockTokenApi: TokenApiModel = {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token'
    };
    const mockResponse = { token: 'new-token' };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    service.renewToken(mockTokenApi).subscribe(response => {
      expect(response.token).toBe('new-token');
    });

    expect(httpClientSpy.post).toHaveBeenCalledWith('https://localhost:7074/api/User/refresh', mockTokenApi);
  });

  it('should return the correct role from the token', () => {
    const mockDecodedToken = { role: 'Admin' };
    spyOn(service, 'decodedToken').and.returnValue(mockDecodedToken);

    const role = service.getRoleFromToken();

    expect(role).toBe('Admin');
  });

  it('should emit true for isLoggedInSubject when login is successful', () => {
    const user = { username: 'test', password: 'password' };
    const mockResponse = { token: 'dummy-token' };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    service.loginUser(user).subscribe(() => {
      service.getLoginState().subscribe(state => {
        expect(state).toBeTrue();
      });
    });
  });

  it('should emit false for isLoggedInSubject when logOut is called', () => {
    spyOn(localStorage, 'clear');

    service.logOut();

    service.getLoginState().subscribe(state => {
      expect(state).toBeFalse();
    });
  });
});
