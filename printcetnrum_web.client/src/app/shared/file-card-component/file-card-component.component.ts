import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserFile } from '../../models/user-models/user-file';

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card-component.component.html',
  styleUrl: './file-card-component.component.css'
})
export class FileCardComponentComponent {
  @Input() title: string = '';
  @Input() files: UserFile[] = [];
  @Input() baseUrl: string = '';
  @Input() selectedFiles: UserFile[] = [];

  @Output() markForPrint = new EventEmitter<{ id: number, shouldPrint: boolean, isFile: boolean }>();
  @Output() editFile = new EventEmitter<number>();
  @Output() openDeleteModal = new EventEmitter<number>();

  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(extension.toLowerCase());
  }

  markFile(file: UserFile) {
    console.log('file-card');
    const isFile = file.isStamp || file.isDiploma ? false : true;
    this.markForPrint.emit({ id: file.id, shouldPrint: !file.shouldPrint, isFile: isFile });
  }

  isUnknownType(extension: string): boolean {
    return !['.pdf', '.doc', '.docx'].includes(extension.toLowerCase()) || !this.isImage(extension);
  }

  isFileSelected(file: UserFile): boolean {
    return this.selectedFiles.some(selected => selected.id === file.id);
  }
}
