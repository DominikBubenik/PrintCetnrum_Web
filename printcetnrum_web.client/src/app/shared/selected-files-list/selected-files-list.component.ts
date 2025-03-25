import { Component, Input } from '@angular/core';
import { UserFile } from '../../models/user-file';

@Component({
  selector: 'app-selected-files-list',
  templateUrl: './selected-files-list.component.html',
  styleUrl: './selected-files-list.component.css'
})
export class SelectedFilesListComponent {
  files: UserFile[] = []; // Load user files here
  @Input() selectedFiles: UserFile[] = [];

  toggleFileSelection(file: UserFile) {
    const index = this.selectedFiles.findIndex(f => f.id === file.id);
    if (index > -1) {
      this.selectedFiles.splice(index, 1); // Deselect file
    } else {
      this.selectedFiles.push(file); // Select file
    }
  }
}
