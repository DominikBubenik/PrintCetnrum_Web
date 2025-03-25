import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private fullName$ = new BehaviorSubject<string>("");
  private role$ = new BehaviorSubject<string>("");
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7074/api/User/';

  getRoleFromStore() {
    return this.role$.asObservable();
  }

  setRoleForStore(role: string) {
    this.role$.next(role);
  }

  getFullNameFromStore() {
    return this.fullName$.getValue();
  }

  getFullNameFromStoreObservable(): Observable<string> {
    return this.fullName$.asObservable();
  }

  setFullNameForStore(fullname: string) {
    console.log('setFullNameForStore', fullname);
    this.fullName$.next(fullname)
  }

  updateUser(id: number, user: any) {
    return this.http.put<any>(`${this.baseUrl}update/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`${this.baseUrl}delete/${id}`);
  }
}
