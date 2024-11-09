import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'https://localhost:7074/api/User/';
  constructor(private http: HttpClient, private router: Router) { }

  loginUser(user: any) {
    console.log(user.surname);
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

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['login'])
  }
}
