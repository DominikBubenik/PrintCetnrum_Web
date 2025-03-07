import { Component, inject, OnInit } from '@angular/core';
import { UserFile } from '../../models/user-file';
import { FileHandlerService } from '../../services/file-handler.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StampService } from '../../services/stamp.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit {
  private authService = inject(AuthService);
  private stampService = inject(StampService);
  private fileHandlerService = inject(FileHandlerService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  files: UserFile[] = [];
  stamps: UserFile[] = [];
  markedFiles: UserFile[] = [];
  unmarkedFiles: UserFile[] = [];
  baseUrl = environment.apiUrl;
  fileIdToDelete: number | null = null;
  criteria: string = 'date';

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.fetchFiles();
    }
  }

  fetchFiles(): void {
    this.fileHandlerService.fetchFiles().subscribe(data => {
      this.files = data;
      this.updateFileLists();
    });
    this.stampService.getUserStamps().pipe(
      map((stamps: any[]) => stamps.map(stamp => ({
        id: stamp.id,
        fileName: stamp.stampName,
        fileUinique: stamp.uniqueName,
        filePath: stamp.stampPath,
        extension: '.json', 
        uploadDate: new Date(stamp.dateCreated),
        shouldPrint: false,
        isStamp: true
      })))
    ).subscribe(mappedStamps => {
      this.stamps = mappedStamps;
    });
  }

  updateFileLists(): void {
    this.markedFiles = this.files.filter(file => file.shouldPrint);
    this.unmarkedFiles = this.files.filter(file => !file.shouldPrint);
  }

  markForPrint(event: { id: number, shouldPrint: boolean }): void {
    this.fileHandlerService.markForPrint(event.id, event.shouldPrint).subscribe(() => {
      this.fetchFiles();
    });
  }

  openDeleteModal(fileId: number, modal: any): void {
    this.fileIdToDelete = fileId;
    this.modalService.open(modal);
  }

  confirmDelete(): void {
    if (this.fileIdToDelete) {
      if (this.stamps.filter(stamp => stamp.id === this.fileIdToDelete)) {
        this.stampService.deleteStamp(this.fileIdToDelete).subscribe(() => {
          this.fetchFiles();
          this.modalService.dismissAll();
        });
      } else {
        this.fileHandlerService.deleteFile(this.fileIdToDelete).subscribe(() => {
          this.fetchFiles();
          this.modalService.dismissAll();
        });
      }
    }
  }

  editFile(id: number) {
    this.router.navigate(['/edit', id]);
  }


  sortFiles(criteria: string): void {
    if (criteria === 'date') {
      this.files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).reverse;
    } else if (criteria === 'type') {
      this.files.sort((a, b) => a.extension.localeCompare(b.extension));
    }
    this.updateFileLists();
  }
}
