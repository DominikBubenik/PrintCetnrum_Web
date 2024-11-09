import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'https://localhost:7074/api/User/';
  constructor(private http: HttpClient) { }

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
}
