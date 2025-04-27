import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth-services/auth.service";
import {Observable} from "rxjs";
import {UserFile} from "../../models/user-models/user-file";

@Injectable({
  providedIn: 'root'
})
export class DesignFilesHandlerService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'https://localhost:7074/api/DesignFile'

  uploadDesignFile(file: File, fileName: string, fileId: number, type: string): Observable<any> {
    const formData = new FormData();
    formData.append('designFile', file);
    formData.append('userName', this.auth.getfullNameFromToken());
    formData.append('fileName', fileName);
    formData.append('fileId', fileId.toString());
    formData.append('type', type);
    return this.http.post(`${this.baseUrl}/uploadDesignFile`, formData);
  }

  getUserDiplomas(): Observable<UserFile[]> {
    const userName = this.auth.getfullNameFromToken();
    return this.http.get<any[]>(`${this.baseUrl}/getUserDesignFiles`, {
      params: { userName: userName,  type: 'Diploma'}
    });
  }
  getUserStamps(): Observable<UserFile[]> {
    const userName = this.auth.getfullNameFromToken();
    return this.http.get<any[]>(`${this.baseUrl}/getUserDesignFiles`, {
      params: { userName: userName,  type: 'Stamp'}
    });
  }

  deleteDesignFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteDesignFile/${id}`);
  }

  downloadDesignFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/downloadDesignFile/${id}`, { responseType: 'blob' });
  }

  getDesignFileById(fileId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/getDesignFileWithId`, fileId, { responseType: 'blob' });
  }

  getDesignFilesById(listOfId: number[]): Observable<any> {
    return this.http.post<UserFile[]>(`${this.baseUrl}/getDesignFilesWithId`, listOfId);
  }
}
