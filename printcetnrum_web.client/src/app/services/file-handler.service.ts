import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
}
