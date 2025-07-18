// confirmation-dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogSubject = new BehaviorSubject<{show: boolean, data: ConfirmationDialogData | null}>({show: false, data: null});
  dialog$ = this.dialogSubject.asObservable();

  show(data: ConfirmationDialogData) {
    this.dialogSubject.next({show: true, data});
  }

  hide() {
    this.dialogSubject.next({show: false, data: null});
  }
}