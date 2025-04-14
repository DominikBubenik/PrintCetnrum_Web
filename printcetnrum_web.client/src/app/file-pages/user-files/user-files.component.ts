import { Component, inject, OnInit } from '@angular/core';
import { UserFile } from '../../models/user-models/user-file';
import { FileHandlerService } from '../../services/file-services/file-handler.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, map } from 'rxjs';
import {DesignFilesHandlerService} from "../../services/file-services/design-files-handler.service";

@Component({
  selector: 'app-user-files',
  templateUrl: './user-files.component.html',
  styleUrl: './user-files.component.css'
})
export class UserFilesComponent implements OnInit {
  private authService = inject(AuthService);
  private designFileService = inject(DesignFilesHandlerService);
  private fileHandlerService = inject(FileHandlerService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  files: UserFile[] = [];
  stamps: UserFile[] = [];
  diplomas: UserFile[] = [];
  images: UserFile[] = [];
  wordFiles: UserFile[] = [];
  pdfFiles: UserFile[] = [];
  markedFiles: UserFile[] = [];
  otherFiles: UserFile[] = [];
  baseUrl = environment.apiUrl;
  fileIdToDelete: number | null = null;
  criteria: string = 'date';
  showPDFFiles = true;
  showWordFiles = true;
  showImages = true;
  showOtherFiles = true;
  showStamps = true;
  showDiplomas = true;


  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.fetchFiles();
    }
  }

  fetchFiles(): void {
    const files$ = this.fileHandlerService.fetchFiles();
    const stamps$ = this.designFileService.getUserStamps().pipe(
      map((stamps: any[]) => stamps.map(stamp => ({
        id: stamp.id,
        fileName: stamp.fileName,
        fileUinique: stamp.uniqueName,
        filePath: stamp.filePath,
        extension: '.json',
        uploadDate: new Date(stamp.dateCreated),
        shouldPrint: stamp.shouldPrint,
        isStamp: true,
        isDiploma: false
      })))
    );
    const diplomas$ = this.designFileService.getUserDiplomas().pipe(
      map((diplomas: any[]) => diplomas.map(diploma => ({
        id: diploma.id,
        fileName: diploma.fileName,
        fileUinique: diploma.uniqueName,
        filePath: diploma.filePath,
        extension: '.json',
        uploadDate: new Date(diploma.dateCreated),
        shouldPrint: diploma.shouldPrint,
        isStamp: false,
        isDiploma: true
      })))
    );

    forkJoin([files$, stamps$, diplomas$]).subscribe({
      next: ([files, stamps, diplomas]) => {
        this.files = files;
        this.stamps = stamps;
        this.diplomas = diplomas;
        this.updateFileLists(); // <-- Only called after all three are done
      },
      error: (err) => {
        console.error('Error loading files:', err);
        // Optional: handle fallback or partial loads
      }
    });
  }

  updateFileLists(): void {
    this.images = [];
    this.wordFiles = [];
    this.pdfFiles = [];
    this.otherFiles = [];
    this.markedFiles = [];
    this.files.forEach(file => {
      if (file.shouldPrint) {
        this.markedFiles.push(file);
      }
      if (this.isImage(file.extension)) {
        this.images.push(file);
      } else if (file.extension === '.doc' || file.extension === '.docx') {
        this.wordFiles.push(file);
      } else if (file.extension === '.pdf') {
        this.pdfFiles.push(file);
      } else {
        this.otherFiles.push(file);
       }
    });
    this.stamps.forEach(file => {
      if (file.shouldPrint) {
        this.markedFiles.push(file);
      }
    });
    this.diplomas.forEach(file => {
      if (file.shouldPrint) {
        this.markedFiles.push(file);
      }
    });
    console.log('images', this.images.length);
  }

  markForPrint(event: { id: number, shouldPrint: boolean, isFile: boolean}): void {
    console.log('user-files');
    this.fileHandlerService.markForPrint(event.id, event.shouldPrint, event.isFile).subscribe(() => {
      this.fetchFiles();
    });
  }

  openDeleteModal(fileId: number, modal: any): void {
    this.fileIdToDelete = fileId;
    this.modalService.open(modal);
  }

  confirmDelete(): void {
    if (this.fileIdToDelete) {
      if (this.stamps.filter(stamp => stamp.id === this.fileIdToDelete) || this.diplomas.filter(diploma => diploma.id === this.fileIdToDelete)) {
        this.designFileService.deleteDesignFile(this.fileIdToDelete).subscribe(() => {
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

  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(extension.toLowerCase());
  }

  editFile(id: number) {
    this.router.navigate(['/edit', id]);
  }


  sortFiles(criteria: string): void {
    if (criteria === 'date') {
      this.files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).reverse;
    } else if (criteria === 'name') {
      this.files.sort((a, b) => a.fileName.localeCompare(b.fileName));
    }
    this.updateFileLists();
  }
}
