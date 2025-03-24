import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserFile } from '../models/user-file';

@Injectable({
  providedIn: 'root'
})
export class DiplomaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'https://localhost:7074/api/Diploma'

  // uploadDiploma(file: File, diplomaName: string, diplomaId: number): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('diplomaFile', file);
  //   formData.append('userName', this.auth.getfullNameFromToken());
  //   formData.append('diplomaName', diplomaName);
  //   formData.append('diplomaId', diplomaId.toString());
  //   return this.http.post(`${this.baseUrl}/uploadDiploma`, formData);
  // }
  //
  // getUserDiplomas(): Observable<UserFile[]> {
  //   const userName = this.auth.getfullNameFromToken();
  //   return this.http.get<any[]>(`${this.baseUrl}/getUserDiplomas?userName=${userName}`);
  // }
  //
  // deleteDiploma(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.baseUrl}/deleteDiploma/${id}`);
  // }
  //
  // downloadDiploma(id: number): Observable<Blob> {
  //   return this.http.get(`${this.baseUrl}/downloadDiploma/${id}`, { responseType: 'blob' });
  // }
  //
  // getDiplomasById(stampId: number): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/getDiplomaWithId`, stampId, { responseType: 'blob' });
  // }
}
