// toast.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toast',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  show = false;
  message = '';
  type: 'success' | 'error' | 'warning' | 'info' = 'info';
  private timer: any;
  
  // Confirm dialog properties
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  private resolveFn: ((value: boolean) => void) | null = null;

  private toastSub!: Subscription;
  private confirmSub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastSub = this.toastService.toast$.subscribe(toast => {
      this.message = toast.message;
      this.type = toast.type;
      this.showToast(toast.duration);
    });
    
    this.confirmSub = this.toastService.confirm$.subscribe(confirm => {
      this.confirmTitle = confirm.title;
      this.confirmMessage = confirm.message;
      this.confirmText = confirm.confirmText;
      this.cancelText = confirm.cancelText;
      this.resolveFn = confirm.resolve;
      this.showConfirm = true;
    });
  }

  showToast(duration: number): void {
    this.show = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.hide(), duration);
  }

  hide(): void {
    this.show = false;
  }

  onConfirm(confirmed: boolean): void {
    this.showConfirm = false;
    if (this.resolveFn) {
      this.resolveFn(confirmed);
      this.resolveFn = null;
    }
  }

  ngOnDestroy(): void {
    this.toastSub.unsubscribe();
    this.confirmSub.unsubscribe();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}