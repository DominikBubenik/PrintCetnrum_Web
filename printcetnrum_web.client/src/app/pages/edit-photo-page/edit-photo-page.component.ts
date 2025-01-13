import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileHandlerService } from '../../services/file-handler.service';
import { UserFile } from '../../models/user-file';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../../shared/snackbar-util';

@Component({
  selector: 'app-edit-photo-page',
  templateUrl: './edit-photo-page.component.html',
  styleUrls: ['./edit-photo-page.component.css']
})
export class EditPhotoPageComponent implements OnInit {
  file: UserFile | null = null;
  brightness: number = 100;
  brightnessStyle: string = `brightness(${this.brightness}%)`;
  imageUrl: string = '';
  baseUrl = environment.apiUrl;
  cropWidth: number = 200;  
  cropHeight: number = 200; 
  cropX: number = 50;      
  cropY: number = 50;      
  imgElement: HTMLImageElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private fileHandlerService: FileHandlerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const fileId = this.route.snapshot.paramMap.get('id');
    if (fileId) {
      this.loadFile(parseInt(fileId));
      this.fileHandlerService.getFile(parseInt(fileId)).subscribe(file => {
        this.file = file;
      });
    }
  }

  loadFile(fileId: number): void {
    this.fileHandlerService.downloadFile(fileId).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      this.imageUrl = url;
    });
  }

  onImageLoad(): void {
    this.imgElement = document.getElementById('image') as HTMLImageElement;
  }

  updateBrightness(): void {
    this.brightnessStyle = `brightness(${this.brightness}%)`;
  }

  revertChanges(): void {
    this.brightness = 100;
    this.brightnessStyle = `brightness(100%)`;
  }

  download(): void {
    if (!this.imgElement) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.filter = `brightness(${this.brightness}%)`;

      ctx.drawImage(
        this.imgElement,
        this.cropX,
        this.cropY,
        this.cropWidth,
        this.cropHeight,
        0,
        0,
        this.cropWidth,
        this.cropHeight
      );

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'modified-image.png';
      link.click();
    }
  }

  applyCrop(): void {
    if (!this.imgElement) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = this.cropWidth;
      canvas.height = this.cropHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height); 

      ctx.drawImage(
        this.imgElement,
        this.cropX, this.cropY,
        this.cropWidth, this.cropHeight,
        0, 0,
        this.cropWidth, this.cropHeight
      );

      const croppedImageUrl = canvas.toDataURL('image/png');
      this.imageUrl = croppedImageUrl;
    }
  }

  saveChanges(): void {
    if (!this.imgElement) return;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.filter = `brightness(${this.brightness}%)`;

      // Apply crop to canvas context
      ctx.drawImage(
        this.imgElement,
        this.cropX,
        this.cropY,
        this.cropWidth,
        this.cropHeight,
        0,
        0,
        this.cropWidth,
        this.cropHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], this.file?.fileName ?? "no_name", { type: blob.type });
          const fileId = this.file?.id;
          if (fileId) {
            this.fileHandlerService.saveChanges(fileId, file).subscribe({
              next: (newFileId) => {
                this.loadFile(newFileId);
                SnackBarUtil.showSnackBar(this.snackBar, 'Changes saved successfully!', 'success');
              },
              error: (err) => {
                console.error(err);
                SnackBarUtil.showSnackBar(this.snackBar, 'Saving failed. Please try again.', 'error');
              },
            });
          }
        }
      }, 'image/' + this.file?.extension);
    }
  }
}
