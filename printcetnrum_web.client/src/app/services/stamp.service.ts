import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class StampService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'https://localhost:7074/api/Stamp'

  uploadStamp(file: File, stampName: string): Observable<any> {
    const formData = new FormData();
    formData.append('stampFile', file);
    formData.append('userName', this.auth.getfullNameFromToken());
    formData.append('stampName', stampName);
    return this.http.post(`${this.baseUrl}/uploadStamp`, formData);
   }

  getUserStamps(): Observable<any[]> {
    const userName = this.auth.getfullNameFromToken();
    return this.http.get<any[]>(`${this.baseUrl}/getUserStamps?userName=${userName}`);
  }

  deleteStamp(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteStamp/${id}`);
  }

  downloadStamp(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/downloadStamp/${id}`, { responseType: 'blob' });
  }

  getStampsById(listOfId: number[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/getStampsWithId`, listOfId);
  }

  updateStamp(id: number, newFile?: File, newStampName?: string): Observable<any> {
    const formData = new FormData();
    if (newFile) {
      formData.append('newStampFile', newFile);
    }
    if (newStampName) {
      formData.append('newStampName', newStampName);
    }

    return this.http.put(`${this.baseUrl}/updateStamp/${id}`, formData);
  }
}
