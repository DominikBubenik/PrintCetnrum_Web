import { Component, Input } from '@angular/core';
import { UserFile } from '../../models/user-models/user-file';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
  styleUrl: './selected-files-list.component.css'
})
export class SelectedFilesListComponent {
  @Input() selectedFiles: UserFile[] = [];
  baseUrl = environment.apiUrl;

  getFileThumbnail(file: UserFile): string | null {
    // Logic to get file thumbnail based on file type
    if (this.isImage(file.extension)) {
      return this.baseUrl + file.filePath; // Assuming filePath contains the image URL
    }
    return null;
  }

  isImage(extension: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.includes(extension.toLowerCase());
  }

  truncateFileName(fileName: string, maxLength: number = 20): string {
    return fileName.length > maxLength
      ? fileName.substring(0, maxLength) + '...'
      : fileName;
  }
}
