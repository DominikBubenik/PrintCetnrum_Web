import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResetPassword } from '../../models/reset-password.model';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private baseUrl = 'https://localhost:7074/api/User';
  private http = inject(HttpClient);

  sendResetPasswordLink(email: string) {
    return this.http.post<any>(`${this.baseUrl}/send-reset-email/${email}`, {});
  }

  resetPassword(resetPasswordObj: ResetPassword) {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, resetPasswordObj);
  }
}
