import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserFile } from '../../models/user-file';

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

  @Output() markForPrint = new EventEmitter<{ id: number, shouldPrint: boolean }>();
  @Output() editFile = new EventEmitter<number>();
  @Output() openDeleteModal = new EventEmitter<number>();
  @Output() toggleSelectFileCard = new EventEmitter<{ id: number, shouldPrint: boolean }>(); 

  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(extension.toLowerCase());
  }

  markFile(file: UserFile) {
    console.log('file-card');
    this.markForPrint.emit({ id: file.id, shouldPrint: !file.shouldPrint });
  }

  isUnknownType(extension: string): boolean {
    return !['.pdf', '.doc', '.docx'].includes(extension.toLowerCase()) || !this.isImage(extension);
  }

  toggleSelection(file: UserFile) {
    console.log('toglujem' + file.id);
    this.toggleSelectFileCard.emit({ id: file.id, shouldPrint: false });
  }

  isFileSelected(file: UserFile): boolean {
    return this.selectedFiles.some(selected => selected.id === file.id);
  }
}
