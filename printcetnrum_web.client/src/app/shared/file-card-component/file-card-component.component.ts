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

  @Output() markForPrint = new EventEmitter<{ id: number, shouldPrint: boolean }>();
  @Output() editFile = new EventEmitter<number>();
  @Output() openDeleteModal = new EventEmitter<number>();

  isImage(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(extension.toLowerCase());
  }

  markFile(file: UserFile) {
    this.markForPrint.emit({ id: file.id, shouldPrint: !file.shouldPrint });
  }
}
