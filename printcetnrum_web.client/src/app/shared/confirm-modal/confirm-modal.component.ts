import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmButtonText: string = 'Confirm';
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();


  constructor() { }


  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.canceled.emit();
  }
}
