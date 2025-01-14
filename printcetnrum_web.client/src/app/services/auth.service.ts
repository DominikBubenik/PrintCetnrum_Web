/**
 * inspired by this tutorial
 * https://www.youtube.com/watch?v=R7s5I9H1H9s&list=PLc2Ziv7051bZhBeJlJaqq5lrQuVmBJL6A
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenApiModel } from '../models/token-api.model';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userStore = inject(UserStoreService);
  private baseUrl = 'https://localhost:7074/api/User/';
  private userPayload: any;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken();
  }

  loginUser(user: any) {
    return this.http.post<any>(this.baseUrl + 'authenticate', user);
  }

  registerUser(user: any) {
    return this.http.post<any>(this.baseUrl + 'register', user);
  }

  getAllUsers() {
    return this.http.get<any>(this.baseUrl + 'getAll');
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
  }

  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue)
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  logOut() {
    localStorage.clear();
    this.isLoggedInSubject.next(false); 
    this.router.navigate(['login'])
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    console.log(jwtHelper.decodeToken(token))
    return jwtHelper.decodeToken(token)
  }

  getfullNameFromToken() {
    if (this.userStore.getFullNameFromStore()) {
      return this.userStore.getFullNameFromStore();
    }
    if (this.userPayload)
      return this.userPayload.unique_name;
  }

  getRoleFromToken() {
    if (this.userPayload)
      return this.userPayload.role;
  }

  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.baseUrl}refresh`, tokenApi)
  }

  getLoginState(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }
}
