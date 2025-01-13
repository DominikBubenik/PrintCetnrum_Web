import { Component } from '@angular/core';
import { FileHandlerService } from '../../services/file-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-upload-photo-page',
  templateUrl: './upload-photo-page.component.html',
  styleUrls: ['./upload-photo-page.component.css']
})
export class UploadPhotoPageComponent {
  selectedFiles: File[] = [];

  constructor(
    private fileHandlerService: FileHandlerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  onFilesSelected(event: any): void {
    this.selectedFiles = event.target.files ? Array.from(event.target.files) : [];
  }

  uploadFiles(): void {
    if (!this.hasFilesToUpload()) {
      SnackBarUtil.showSnackBar(this.snackBar, 'No files selected for upload.', 'warning');
      return;
    }

    this.fileHandlerService.uploadFiles(this.selectedFiles).subscribe({
      next: () => this.handleUploadSuccess(),
      error: (err) => this.handleUploadError(err),
    });
  }

  private hasFilesToUpload(): boolean {
    return this.selectedFiles && this.selectedFiles.length > 0;
  }

  private handleUploadSuccess(): void {
    SnackBarUtil.showSnackBar(this.snackBar, 'Upload successful!', 'success');
    this.router.navigate(['/userFiles']);
  }

  private handleUploadError(error: any): void {
    console.error('File upload failed:', error);
    SnackBarUtil.showSnackBar(this.snackBar, 'Upload failed. Please try again.', 'error');
  }
}
