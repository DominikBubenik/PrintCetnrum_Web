import { Component } from '@angular/core';
import { FileHandlerService } from '../services/file-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-upload-photo-page',
  templateUrl: './upload-photo-page.component.html',
  styleUrl: './upload-photo-page.component.css'
})
export class UploadPhotoPageComponent {
  selectedFile: File | null = null;
  uploadedImagePath: string | null = null;

  constructor(
    private fileHandlerService: FileHandlerService,
    private snackBar: MatSnackBar
  ) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadImage(): void {
    if (this.selectedFile) {
      this.fileHandlerService.uploadImage(this.selectedFile).subscribe(
        (response) => {
          this.uploadedImagePath = response.filePath; // Use the returned file path
          console.log('Image uploaded successfully:', this.uploadedImagePath);
          this.snackBar.open('Upload successfull!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'app-notification-success'
          });
        },
        (error) => {
          console.error('Image upload failed:', error);
        }
      );
    }
  }
}
