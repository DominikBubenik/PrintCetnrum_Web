import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private fullName$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");
  private baseUrl = 'https://localhost:7074/api/User/';
  constructor(private http: HttpClient) { }

  public getRoleFromStore() {
    return this.role$.asObservable();
  }

  public setRoleForStore(role: string) {
    this.role$.next(role);
  }

  public getFullNameFromStore() {
    return this.fullName$.asObservable();
  }

  public setFullNameForStore(fullname: string) {
    this.fullName$.next(fullname)
  }

  public updateUser(id: number, user: any) {
    return this.http.put<any>(`${this.baseUrl}update/${id}`, user);
  }

  // Backend: Delete user
  public deleteUser(id: number) {
    return this.http.delete<any>(`${this.baseUrl}delete/${id}`);
  }
}
