import { Component, OnInit, signal } from '@angular/core';
import { UserFile } from '../models/user-file';
import { FileHandlerService } from '../services/file-handler.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit{
  files: UserFile[] = [];
  //allFiles = new BehaviorSubject<UserFile[]>([]);
  reloadImages = signal<boolean>(false);
  baseUrl = environment.apiUrl;
  

  constructor(private fileHandlerService: FileHandlerService, private router: Router) { }

  ngOnInit() {
    this.fileHandlerService.fetchFiles().subscribe(files => this.files = files);
    console.log("I am back");
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
