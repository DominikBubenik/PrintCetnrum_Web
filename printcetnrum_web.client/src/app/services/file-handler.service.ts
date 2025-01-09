import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UserFile } from '../shared/user-file';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  private baseUrl = 'https://localhost:7074/api/Upload/'
  constructor(private http: HttpClient, private auth: AuthService) { }

  uploadImage(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', this.auth.getfullNameFromToken());
    formData.append('shouldPrint', String(false));
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    return this.http.post<any>(this.baseUrl + 'uploadImage', formData);
  }


  fetchFiles(): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(this.baseUrl + `getUserFiles?userName=${this.auth.getfullNameFromToken()}`);
  }

  markForPrint(id: number, shouldPrint: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}updatePrintStatus/${id}`, shouldPrint);
  }

  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  }

  getFile(id: number): Observable<UserFile> {
    return this.http.get<UserFile>(`${this.baseUrl}getUserFile/${id}`);
  }
}
