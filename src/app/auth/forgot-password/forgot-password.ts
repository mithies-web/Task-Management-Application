import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ForgotPasswordForm {
  email: string;
  otp: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword implements OnInit, OnDestroy {
  private isBrowser: boolean;
  private countdownInterval: any;

  formData: ForgotPasswordForm = {
    email: '',
    otp: ''
  };

  emailValid = false;
  emailError = false;
  isOtpSent = false;
  timeLeft = 0;
  isLoading = false;
  loadingText = '';

  features = [
    'Secure Verification',
    'Instant OTP Delivery'
  ];

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  get submitButtonText(): string {
    return this.isOtpSent ? 'VERIFY OTP' : 'SEND OTP';
  }

  validateEmail() {
    if (this.formData.email === '') {
      this.emailValid = false;
      this.emailError = false;
      return;
    }

    this.emailValid = this.emailRegex.test(this.formData.email);
    this.emailError = !this.emailValid;
  }

  canSubmit(): boolean {
    if (!this.isOtpSent) {
      return this.emailValid && !!this.formData.email;
    } else {
      return this.formData.otp.length === 6 && /^\d+$/.test(this.formData.otp);
    }
  }

  onOtpInput() {
    // Auto-submit when 6 digits are entered
    if (this.formData.otp.length === 6 && /^\d+$/.test(this.formData.otp)) {
      // Optional: Auto-submit or just validate
    }
  }

  onSubmit() {
    if (!this.canSubmit()) {
      return;
    }

    if (!this.isOtpSent) {
      // First submission - send OTP
      this.sendOtp();
    } else {
      // Second submission - verify OTP
      this.verifyOtp();
    }
  }

  sendOtp() {
    this.isLoading = true;
    this.loadingText = 'Sending OTP...';

    // Simulate API call
    setTimeout(() => {
      if (this.isBrowser) {
        console.log('OTP sent to:', this.formData.email);
        // Store email for password reset flow
        sessionStorage.setItem('resetEmail', this.formData.email);
      }
      
      this.isOtpSent = true;
      this.isLoading = false;
      this.startCountdown();
      
      // Show success feedback
      if (this.isBrowser) {
        alert('OTP sent successfully! Please check your email.');
      }
    }, 1500);
  }

  verifyOtp() {
    this.isLoading = true;
    this.loadingText = 'Verifying...';

    // Simulate API verification
    setTimeout(() => {
      if (this.isBrowser) {
        console.log('OTP verified:', this.formData.otp);
        
        // Navigate to set new password page
        this.router.navigate(['/set-new-password']);
      }
      
      this.isLoading = false;
    }, 1500);
  }

  resendOtp() {
    if (this.timeLeft > 0) {
      return;
    }

    if (this.isBrowser) {
      console.log('Resending OTP to:', this.formData.email);
    }
    
    this.startCountdown();
    
    // Show temporary feedback
    if (this.isBrowser) {
      alert('OTP sent again! Please check your email.');
    }
  }

  startCountdown() {
    this.timeLeft = 60;
    
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

  goBack() {
    console.log('Going back...');
    if (this.isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToLogin() {
    console.log('Navigating to login...');
    this.router.navigate(['/login']);
  }
}