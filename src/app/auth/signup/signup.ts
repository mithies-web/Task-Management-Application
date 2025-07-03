import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup implements OnInit {

  image: string = 'public/logo/logo-black.png';
  illustration: string = 'public/logo/full-logo.png';

  private isBrowser: boolean;
  
  formData: SignupForm = {
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  };

  emailValid = false;
  passwordValid = false;
  confirmPasswordValid = false;
  emailError = false;
  passwordError = false;
  confirmPasswordError = false;
  termsError = false;
  
  showPassword = false;
  showConfirmPassword = false;
  showPasswordRequirements = false;
  
  lengthValid = false;
  numberValid = false;
  specialValid = false;
  passwordStrength = 0;

  features = [
    'Real-Time Collaboration',
    'Smart Notifications',
    'Advanced Analytics'
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

  validateEmail() {
    if (this.formData.email === '') {
      this.emailValid = false;
      this.emailError = false;
      return;
    }

    this.emailValid = this.emailRegex.test(this.formData.email);
    this.emailError = !this.emailValid;

    // Reset password fields when email changes
    if (!this.emailValid) {
      this.formData.password = '';
      this.formData.confirmPassword = '';
      this.passwordValid = false;
      this.confirmPasswordValid = false;
      this.passwordError = false;
      this.confirmPasswordError = false;
      this.showPasswordRequirements = false;
    }
  }

  validatePassword() {
    const password = this.formData.password;
    
    // Update password requirements
    this.lengthValid = password.length >= 8;
    this.numberValid = /\d/.test(password);
    this.specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Calculate strength
    this.passwordStrength = 0;
    if (this.lengthValid) this.passwordStrength++;
    if (this.numberValid) this.passwordStrength++;
    if (this.specialValid) this.passwordStrength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) this.passwordStrength++;
    
    // Validate password (minimum requirements)
    this.passwordValid = this.lengthValid && this.numberValid && this.specialValid;
    this.passwordError = password.length > 0 && !this.passwordValid;
    
    // Reset confirm password when password changes
    if (!this.passwordValid) {
      this.formData.confirmPassword = '';
      this.confirmPasswordValid = false;
      this.confirmPasswordError = false;
    }
    
    // Revalidate confirm password if it has content
    if (this.formData.confirmPassword) {
      this.validateConfirmPassword();
    }
  }

  validateConfirmPassword() {
    if (this.formData.confirmPassword === '') {
      this.confirmPasswordValid = false;
      this.confirmPasswordError = false;
      return;
    }

    this.confirmPasswordValid = this.formData.password === this.formData.confirmPassword;
    this.confirmPasswordError = !this.confirmPasswordValid;
  }

  validateTerms() {
    this.termsError = !this.formData.terms;
  }

  onPasswordBlur() {
    if (this.formData.password.length === 0) {
      this.showPasswordRequirements = false;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getStrengthColor(index: number): string {
    if (index >= this.passwordStrength) {
      return '#e5e7eb';
    }
    
    if (this.passwordStrength === 1) return '#ef4444';
    if (this.passwordStrength === 2) return '#f59e0b';
    if (this.passwordStrength === 3) return '#3b82f6';
    if (this.passwordStrength === 4) return '#10b981';
    
    return '#e5e7eb';
  }

  isFormValid(): boolean {
    return this.emailValid && this.passwordValid && this.confirmPasswordValid && this.formData.terms;
  }

  onSubmit() {
    this.validateTerms();
    
    if (!this.isFormValid()) {
      return;
    }

    console.log('Signup form submitted:', this.formData);

    // Store form data in sessionStorage (simulating signup process)
    if (this.isBrowser) {
      sessionStorage.setItem('signupEmail', this.formData.email);
    }
    
    // Navigate to OTP verification page
    console.log('Navigating to OTP verification...');
    this.router.navigate(['/otp-verification']);
  }

  goBack() {
    console.log('Going back...');
    if (this.isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  navigateToLogin() {
    console.log('Navigating to login...');
    this.router.navigate(['/login']);
  }
}