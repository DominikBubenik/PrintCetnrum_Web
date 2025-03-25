import { Component, inject, OnInit } from '@angular/core';
import { UserFile } from '../../models/user-file';
import { FileHandlerService } from '../../services/file-handler.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import {DesignFilesHandlerService} from "../../services/design-files-handler.service";

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
    this.fileHandlerService.fetchFiles().subscribe(data => {
      this.files = data;
      this.updateFileLists();
    });
    this.designFileService.getUserStamps().pipe(
      map((stamps: any[]) => stamps.map(stamp => ({
        id: stamp.id,
        fileName: stamp.fileName,
        fileUinique: stamp.uniqueName,
        filePath: stamp.filePath,
        extension: '.json',
        uploadDate: new Date(stamp.dateCreated),
        shouldPrint: false,
        isStamp: true,
        isDiploma: false
      })))
    ).subscribe(mappedStamps => {
      this.stamps = mappedStamps;
    });
    this.designFileService.getUserDiplomas().pipe(
      map((diplomas: any[]) => diplomas.map(diploma => ({
        id: diploma.id,
        fileName: diploma.fileName,
        fileUinique: diploma.uniqueName,
        filePath: diploma.filePath,
        extension: '.json',
        uploadDate: new Date(diploma.dateCreated),
        shouldPrint: false,
        isStamp: false,
        isDiploma: true
      })))).subscribe((mappedDiplomas: UserFile[]) => { this.diplomas = mappedDiplomas });
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
  }

  markForPrint(event: { id: number, shouldPrint: boolean }): void {
    console.log('user-files');
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
    } else if (criteria === 'type') {
      this.files.sort((a, b) => a.extension.localeCompare(b.extension));
    }
    this.updateFileLists();
  }

  startOrder() { }

  toggleSelection(event: any):void {
    console.log('toto je ten co je v sidebare' + event.id);
    this.fileHandlerService.markForPrint(event.id, true).subscribe(() => {
      this.fetchFiles();
    });
  }
}
