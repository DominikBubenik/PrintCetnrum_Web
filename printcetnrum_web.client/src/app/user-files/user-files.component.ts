import { Component, inject, OnInit, signal } from '@angular/core';
import { UserFile } from '../models/user-file';
import { FileHandlerService } from '../services/file-handler.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit {
  private authService = inject(AuthService);
  files: UserFile[] = [];
  //allFiles = new BehaviorSubject<UserFile[]>([]);
  reloadImages = signal<boolean>(false);
  baseUrl = environment.apiUrl;
  

  constructor(private fileHandlerService: FileHandlerService, private router: Router) {
    this.fetchFiles();
  }

  ngOnInit() {
    console.log("I am bacckkk");
    this.authService.getLoginState().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        console.log('User logged in. Fetching files...');
        this.fetchFiles(); // Fetch files when user logs in
      } else {
        console.log('User logged out. Fetching files...');
        this.fetchFiles(); // Fetch files when user logs out
      }
    });

    if (this.authService.isLoggedIn()) {
      this.fetchFiles();
    }
  }

  fetchFiles(): void {
    this.fileHandlerService.fetchFiles().subscribe(data => {
      this.files = data;
    });
  }

  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(extension.toLowerCase());
  }

  markForPrint(id: number, shouldPrint: boolean): void {
    this.fileHandlerService.markForPrint(id, shouldPrint).subscribe(() => {
      this.fetchFiles(); 
    });
  }

  deleteFile(id: number): void {
    this.fileHandlerService.deleteFile(id).subscribe(() => {
      this.fetchFiles(); 
    });
  }

  editFile(id: number) {
    this.router.navigate(['/edit', id]);
    
  }

  reloadFiles(reload: boolean): void {
    if (reload) {
      this.fetchFiles();
    }
  }
}

