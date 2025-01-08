import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-photo-page',
  templateUrl: './edit-photo-page.component.html',
  styleUrl: './edit-photo-page.component.css'
})
export class EditPhotoPageComponent {
  brightness: number = 100;  // Default brightness
  brightnessStyle: string = `brightness(${this.brightness}%)`;
  imageUrl: string = '';  // Store the uploaded image URL

  // Handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;  // Set the image URL for preview
      };
      reader.readAsDataURL(file);

      // Call the method to upload the file to the server
      this.uploadFile(file);
    }
  }

  // Function to upload the file to the server
  uploadFile(file: File) {
    //const formData = new FormData();
    //formData.append('file', file, file.name);

    //// Use Angular's HttpClient to send the file to the server
    //// For simplicity, we'll assume you have an API endpoint for handling the file upload
    //this.http.post('http://localhost:5000/api/upload', formData).subscribe(response => {
    //  console.log('File uploaded successfully', response);
    //}, error => {
    //  console.error('Error uploading file', error);
    //});
  }
}
