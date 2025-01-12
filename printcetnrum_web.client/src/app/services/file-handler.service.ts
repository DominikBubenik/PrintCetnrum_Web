import { inject, Injectable, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { UserFile } from '../models/user-file';
import { ValueChangeEvent } from '@angular/forms';
import { UserStoreService } from './user-store.service';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {
  private userStore = inject(UserStoreService);
  private baseUrl = 'https://localhost:7074/api/Upload/'

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  uploadFiles(files: File[]): Observable<{ filePath: string }[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); 
    });
    formData.append('userName', this.auth.getfullNameFromToken());
    formData.append('shouldPrint', String(false));
    return this.http.post<{ filePath: string }[]>(this.baseUrl + 'uploadFiles', formData);
  }

  fetchFiles(): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(this.baseUrl + `getUserFiles?userName=${this.auth.getfullNameFromToken() }`);
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

  saveChanges(id: number, file: File): Observable<number> {
    const formData = new FormData();
    formData.append('newFile', file); // Append the file to the FormData object
    console.log(formData.forEach((value, key) => {
      console.log('this is value' + value);
    }
    ));
    return this.http.put<number>(`${this.baseUrl}replaceFile/${id}`, formData);
  }


  downloadFile(fileId: number) {
    return this.http.get(`${this.baseUrl}downloadFile/${fileId}`, {
      responseType: 'blob', // Binary response
    });
  }
}
