// confirmation-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    CommonModule
  ],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css']
})
export class ConfirmationDialog {
  @Input() show: boolean = false;
  @Input() data: any = null;
  @Output() confirmed = new EventEmitter<boolean>();

  onConfirm() {
    this.confirmed.emit(true);
  }

  onCancel() {
    this.confirmed.emit(false);
  }
}