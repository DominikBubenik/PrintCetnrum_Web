import { Component, OnInit } from '@angular/core';
import { UserFile } from '../shared/user-file';
import { FileHandlerService } from '../services/file-handler.service';

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit{
  files: UserFile[] = [];

  constructor(private fileHandlerService: FileHandlerService) { }

  ngOnInit() {
    this.fileHandlerService.fetchFiles().subscribe(files => this.files = files);
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
    console.log(`Edit file ${id}`);
  }
}
