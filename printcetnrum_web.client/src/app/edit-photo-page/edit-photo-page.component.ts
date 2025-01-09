import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileHandlerService } from '../services/file-handler.service';
import { UserFile } from '../shared/user-file';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-photo-page',
  templateUrl: './edit-photo-page.component.html',
  styleUrls: ['./edit-photo-page.component.css']
})
export class EditPhotoPageComponent implements OnInit {
  file: UserFile | null = null; 
  brightness: number = 100;  // Default brightness
  brightnessStyle: string = `brightness(${this.brightness}%)`;
  imageUrl: string = '';  
  baseUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private fileHandlerService: FileHandlerService // Inject file service to fetch file data
  ) { }

  ngOnInit(): void {
    const fileId = this.route.snapshot.paramMap.get('id'); // Get file ID from URL
    if (fileId) {
      this.loadFile(parseInt(fileId)); // Load the file details
    }
  }

  loadFile(fileId: number): void {
    this.fileHandlerService.getFile(fileId).subscribe(file => {
      this.file = file;
      this.imageUrl = this.baseUrl + this.file?.filePath;
    });
  }

  updateBrightness(): void {
    this.brightnessStyle = `brightness(${this.brightness}%)`;  // Update the filter with new brightness
  }
}
