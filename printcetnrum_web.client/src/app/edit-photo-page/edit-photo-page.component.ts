import { Component } from '@angular/core';

@Component({
  selector: 'app-edit-photo-page',
  templateUrl: './edit-photo-page.component.html',
  styleUrl: './edit-photo-page.component.css'
})
export class EditPhotoPageComponent {
  brightness: number = 100;

  get brightnessStyle(): string {
    return `brightness(${this.brightness}%)`;
  }
}
