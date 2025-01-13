import { Component, inject, OnInit, signal } from '@angular/core';
import { UserFile } from '../../models/user-file';
import { FileHandlerService } from '../../services/file-handler.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit {
  private authService = inject(AuthService);
  files: UserFile[] = [];
  baseUrl = environment.apiUrl;
  fileIdToDelete: number | null = null;
  constructor(
    private fileHandlerService: FileHandlerService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit() {
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

  openDeleteModal(fileId: number, modal: any): void {
    this.fileIdToDelete = fileId;
    this.modalService.open(modal);
  }

  confirmDelete(): void {
    if (this.fileIdToDelete) {
      this.fileHandlerService.deleteFile(this.fileIdToDelete).subscribe(() => {
        this.fetchFiles();
        this.modalService.dismissAll();
      });
    }
  }

  editFile(id: number) {
    this.router.navigate(['/edit', id]);
  }
}

