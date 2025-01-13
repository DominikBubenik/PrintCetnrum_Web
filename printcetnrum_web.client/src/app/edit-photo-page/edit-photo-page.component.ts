import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileHandlerService } from '../services/file-handler.service';
import { UserFile } from '../models/user-file';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarUtil } from '../shared/snackbar-util';


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

  updateBrightness(): void {
    this.brightnessStyle = `brightness(${this.brightness}%)`;
  }

  revertChanges(): void {
    this.brightness = 100;
    this.brightnessStyle = `brightness(100%)`;
  }

  download(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const img = document.getElementById('image') as HTMLImageElement;

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.filter = `brightness(${this.brightness}%)`;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'modified-image.png';
      link.click();
    }
  }

  saveChanges(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const img = document.getElementById('image') as HTMLImageElement;

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.filter = `brightness(${this.brightness}%)`;
      ctx.drawImage(img, 0, 0, img.width, img.height);

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
