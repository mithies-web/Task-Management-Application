// toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<any>();
  private confirmSubject = new Subject<any>();

  toast$ = this.toastSubject.asObservable();
  confirm$ = this.confirmSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000): void {
    this.toastSubject.next({ message, type, duration });
  }

  showConfirm(title: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmSubject.next({
        title,
        message,
        confirmText,
        cancelText,
        resolve
      });
    });
  }
}