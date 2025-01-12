import { Component } from '@angular/core';
import { FileHandlerService } from '../services/file-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-photo-page',
  templateUrl: './upload-photo-page.component.html',
  styleUrls: ['./upload-photo-page.component.css']
})
export class UploadPhotoPageComponent {
  selectedFiles: File[] = []; // Initialize as an empty array

  constructor(
    private fileHandlerService: FileHandlerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  onFilesSelected(event: any): void {
    this.selectedFiles = event.target.files ? Array.from(event.target.files) : [];
  }

  uploadFiles(): void {
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.fileHandlerService.uploadFiles(this.selectedFiles).subscribe(
        (response) => {
          this.snackBar.open('Upload successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
          this.router.navigate(['/userFiles']);
        },
        (error) => {
          console.error('File upload failed:', error);
          this.snackBar.open('Upload failed. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-error'
          });
        }
      );
    } else {
      this.snackBar.open('No files selected for upload.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'app-notification-warning'
      });
    }
  }
}
