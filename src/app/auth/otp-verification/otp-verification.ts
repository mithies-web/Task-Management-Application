import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface OtpForm {
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  digit5: string;
  digit6: string;
}

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Back Button -->
    <a (click)="goBack()" class="back-btn bg-white text-primary hover:bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
      <i class="fas fa-arrow-left"></i>
    </a>

    <div class="flex flex-col md:flex-row h-screen">
      <!-- Illustration Section -->
      <div class="illustration hidden md:flex flex-col items-center justify-center p-12 w-full md:w-1/2 text-white relative">
        <div class="max-w-md">
          <img src="https://via.placeholder.com/328x192/6366f1/white?text=GenFlow+Logo" alt="OTP Verification" class="ml-20 w-82 h-48">
          <h2 class="text-3xl font-bold mt-8 mb-4 ml-20">Secure Verification</h2>
          <p class="text-xl opacity-90">We've sent a one-time password to your email to ensure your account security.</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <div class="flex items-center" *ngFor="let feature of features">
              <div class="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2">
                <i class="fas fa-check text-lg"></i>
              </div>
              <span class="text-lg">{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- OTP Verification Form Section -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div class="auth-container rounded-xl p-8 sm:p-10 w-full max-w-xl">
          <!-- Header -->
          <div class="text-center mb-10">
            <div class="flex items-center justify-center mb-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-3">
                <img src="https://via.placeholder.com/48x48/6366f1/white?text=GF" alt="GenFlow Logo">
              </div>
              <span class="text-3xl font-bold text-gray-800">GenFlow</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Verify Your Account</h1>
            <p class="text-gray-600">Enter the 6-digit code sent to your email</p>
          </div>

          <!-- Email Display -->
          <div class="text-center mb-8">
            <p class="text-gray-700 mb-2">We've sent a verification code to:</p>
            <p class="font-medium text-primary text-lg">{{ userEmail }}</p>
          </div>

          <!-- OTP Form -->
          <form (ngSubmit)="onSubmit()" #otpForm="ngForm" class="space-y-6">
            <!-- OTP Input -->
            <div class="flex justify-center mb-6">
              <div class="flex space-x-2">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit1"
                  name="digit1"
                  (input)="onDigitInput($event, 0)"
                  (keydown)="onKeyDown($event, 0)"
                  (paste)="onPaste($event)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit2"
                  name="digit2"
                  (input)="onDigitInput($event, 1)"
                  (keydown)="onKeyDown($event, 1)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit3"
                  name="digit3"
                  (input)="onDigitInput($event, 2)"
                  (keydown)="onKeyDown($event, 2)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit4"
                  name="digit4"
                  (input)="onDigitInput($event, 3)"
                  (keydown)="onKeyDown($event, 3)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit5"
                  name="digit5"
                  (input)="onDigitInput($event, 4)"
                  (keydown)="onKeyDown($event, 4)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
                <input 
                  #otpInput
                  type="text" 
                  maxlength="1" 
                  [(ngModel)]="formData.digit6"
                  name="digit6"
                  (input)="onDigitInput($event, 5)"
                  (keydown)="onKeyDown($event, 5)"
                  class="otp-digit w-14 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  inputmode="numeric" 
                  pattern="[0-9]*">
              </div>
            </div>

            <!-- Countdown and Resend -->
            <div class="flex justify-between items-center mb-8">
              <div [class.hidden]="timeLeft <= 0" class="text-base text-gray-500">
                Resend code in <span>{{ formatTime(timeLeft) }}</span>
              </div>
              <button 
                type="button" 
                (click)="resendOtp()" 
                [class.hidden]="timeLeft > 0"
                class="text-base font-medium text-primary hover:text-primary/80 cursor-pointer bg-transparent border-none">
                Resend OTP
              </button>
            </div>

            <!-- Verify Button -->
            <div>
              <button 
                type="submit" 
                [disabled]="!isFormValid() || isLoading"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition-colors duration-200"
                [ngClass]="{'bg-primary hover:bg-primary/90': isFormValid() && !isLoading, 'bg-gray-400 cursor-not-allowed': !isFormValid() || isLoading}">
                <span *ngIf="!isLoading">Verify Account</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <span class="mr-2">Verifying...</span>
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </button>
            </div>
          </form>

          <!-- Alternative Options -->
          <div class="mt-8 text-center text-base text-gray-600">
            <p class="mb-2">Didn't receive the code?</p>
            <button 
              type="button"
              (click)="checkSpamFolder()" 
              class="font-medium text-primary hover:text-primary/80 cursor-pointer bg-transparent border-none">
              Check spam folder
            </button>
            <span class="mx-2">or</span>
            <button 
              type="button"
              (click)="changeEmailAddress()" 
              class="font-medium text-primary hover:text-primary/80 cursor-pointer bg-transparent border-none">
              Change email address
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      background: white;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .illustration {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    }
    .back-btn {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 10;
      transition: all 0.3s ease;
    }
    .back-btn:hover {
      transform: translateX(-3px);
    }
    .otp-digit:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  `]
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  private isBrowser: boolean;
  private countdownInterval: any;

  formData: OtpForm = {
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: ''
  };

  userEmail = 'user@example.com';
  timeLeft = 300; // 5 minutes in seconds
  isLoading = false;

  features = [
    'Instant Delivery',
    'Expires in 5 Minutes'
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Get email from sessionStorage
    if (this.isBrowser) {
      const savedEmail = sessionStorage.getItem('signupEmail') || sessionStorage.getItem('resetEmail');
      if (savedEmail) {
        this.userEmail = savedEmail;
      }
    }

    // Start countdown timer
    this.startCountdown();

    // Focus on first input after view init
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.first) {
        this.otpInputs.first.nativeElement.focus();
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onDigitInput(event: any, index: number) {
    const value = event.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      event.target.value = '';
      return;
    }

    // Auto-advance to next input
    if (value.length === 1 && index < 5) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }

    // Auto-submit when all digits are filled
    if (this.isFormValid()) {
      setTimeout(() => {
        this.onSubmit();
      }, 100);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Handle backspace to move to previous input
    const target = event.currentTarget as HTMLInputElement;
    if (event.key === 'Backspace' && !target?.value && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    
    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      this.formData.digit1 = digits[0];
      this.formData.digit2 = digits[1];
      this.formData.digit3 = digits[2];
      this.formData.digit4 = digits[3];
      this.formData.digit5 = digits[4];
      this.formData.digit6 = digits[5];

      // Update input values
      this.otpInputs.toArray().forEach((input, index) => {
        input.nativeElement.value = digits[index];
      });

      // Focus on last input
      const lastInput = this.otpInputs.toArray()[5];
      if (lastInput) {
        lastInput.nativeElement.focus();
      }

      // Auto-submit
      setTimeout(() => {
        this.onSubmit();
      }, 100);
    }
  }

  isFormValid(): boolean {
    const otp = this.getOtpValue();
    return otp.length === 6 && /^\d{6}$/.test(otp);
  }

  getOtpValue(): string {
    return this.formData.digit1 + this.formData.digit2 + this.formData.digit3 + 
           this.formData.digit4 + this.formData.digit5 + this.formData.digit6;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
  }

  startCountdown() {
    this.timeLeft = 300; // 5 minutes
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  resendOtp() {
    if (this.timeLeft > 0) {
      return;
    }

    console.log('Resending OTP to:', this.userEmail);
    
    // Restart countdown
    this.startCountdown();
    
    // Show feedback
    if (this.isBrowser) {
      alert('OTP sent again! Please check your email.');
    }
  }

  onSubmit() {
    if (!this.isFormValid() || this.isLoading) {
      return;
    }

    const otp = this.getOtpValue();
    this.isLoading = true;

    console.log('Verifying OTP:', otp);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      if (this.isBrowser) {
        // Clear session storage
        sessionStorage.removeItem('signupEmail');
        sessionStorage.removeItem('resetEmail');
        
        // Show success message
        alert('Account verified successfully!');
        
        // Navigate to login
        this.router.navigate(['/login']);
      }
    }, 1500);
  }

  checkSpamFolder() {
    if (this.isBrowser) {
      alert('Please check your spam or junk folder if you don\'t see our email in your inbox.');
    }
  }

  changeEmailAddress() {
    if (this.isBrowser) {
      const confirmed = confirm('Do you want to change your email address?');
      if (confirmed) {
        this.router.navigate(['/signup']);
      }
    }
  }

  goBack() {
    console.log('Going back...');
    if (this.isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/signup']);
    }
  }
}