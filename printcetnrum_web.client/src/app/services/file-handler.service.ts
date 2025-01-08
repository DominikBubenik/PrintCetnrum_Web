import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  private baseUrl = 'https://localhost:7074/api/Upload/'
  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.baseUrl + 'uploadImage', formData);
  }
}
