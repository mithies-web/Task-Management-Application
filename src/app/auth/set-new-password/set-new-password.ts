import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirements {
  length: boolean;
  number: boolean;
  special: boolean;
  case: boolean;
}

@Component({
  selector: 'app-set-new-password',
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
          <img src="https://via.placeholder.com/328x192/6366f1/white?text=GenFlow+Logo" alt="Password Security" class="w-82 h-48 ml-10">
          <h2 class="text-3xl font-bold mt-8 mb-4 ml-20">Secure Your Account</h2>
          <p class="text-xl opacity-90">Create a strong password to protect your GAI TaskFlow account and data.</p>
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

      <!-- Password Reset Form Section -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div class="auth-container rounded-xl p-8 sm:p-10 w-full max-w-md">
          <!-- Header -->
          <div class="text-center mb-10">
            <div class="flex items-center justify-center mb-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <img src="https://via.placeholder.com/40x40/6366f1/white?text=GF" alt="GenFlow Logo">
              </div>
              <span class="text-3xl font-bold text-gray-800">GenFlow</span>
            </div>
            <h1 class="text-xl font-bold text-gray-800 mb-2">Set New Password</h1>
            <p class="text-gray-600">Create a strong password to secure your account</p>
          </div>

          <!-- Password Reset Form -->
          <form (ngSubmit)="onSubmit()" #passwordForm="ngForm" class="space-y-6">
            <!-- New Password Input -->
            <div>
              <label for="new-password" class="block text-md font-medium text-gray-700 mb-2">New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  [type]="showNewPassword ? 'text' : 'password'" 
                  id="new-password" 
                  name="new-password" 
                  [(ngModel)]="formData.newPassword"
                  required 
                  (input)="validatePassword()"
                  class="input-field block w-full pl-10 pr-10 py-3 text-md border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  [class.input-success]="isPasswordValid && !!formData.newPassword"
                  [class.input-error]="passwordError && !!formData.newPassword"
                  placeholder="••••••••">
                <button 
                  type="button"
                  (click)="toggleNewPassword()"
                  class="password-toggle absolute text-gray-400 hover:text-gray-600 focus:outline-none">
                  <i [class]="showNewPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
                </button>
              </div>
              <div class="mt-2 grid grid-cols-4 gap-1">
                <div 
                  class="password-strength rounded h-1"
                  [style.background-color]="getStrengthColor(0)">
                </div>
                <div 
                  class="password-strength rounded h-1"
                  [style.background-color]="getStrengthColor(1)">
                </div>
                <div 
                  class="password-strength rounded h-1"
                  [style.background-color]="getStrengthColor(2)">
                </div>
                <div 
                  class="password-strength rounded h-1"
                  [style.background-color]="getStrengthColor(3)">
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">Minimum 8 characters with at least one number and special character</p>
            </div>

            <!-- Confirm New Password Input -->
            <div>
              <label for="confirm-password" class="block text-md font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  [type]="showConfirmPassword ? 'text' : 'password'" 
                  id="confirm-password" 
                  name="confirm-password" 
                  [(ngModel)]="formData.confirmPassword"
                  required 
                  (input)="validateConfirmPassword()"
                  class="input-field block w-full pl-10 pr-10 py-3 text-md border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  [class.input-success]="confirmPasswordValid && !!formData.confirmPassword"
                  [class.input-error]="confirmPasswordError && !!formData.confirmPassword"
                  placeholder="••••••••">
                <button 
                  type="button"
                  (click)="toggleConfirmPassword()"
                  class="password-toggle absolute text-gray-400 hover:text-gray-600 focus:outline-none">
                  <i [class]="showConfirmPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
                </button>
              </div>
              <p class="mt-1 text-sm" [class.hidden]="!formData.confirmPassword" 
                 [ngClass]="confirmPasswordValid ? 'text-green-500' : 'text-red-500'">
                {{ confirmPasswordValid ? 'Passwords match' : 'Passwords do not match' }}
              </p>
            </div>

            <!-- Submit Button -->
            <div>
              <button 
                type="submit" 
                [disabled]="!isFormValid() || isLoading"
                class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-md font-medium text-white transition-colors duration-200"
                [ngClass]="{'bg-primary hover:bg-primary/90': isFormValid() && !isLoading, 'bg-gray-400 cursor-not-allowed': !isFormValid() || isLoading}">
                <span *ngIf="!isLoading">Update Password</span>
                <span *ngIf="isLoading" class="flex items-center">
                  <span class="mr-2">Updating...</span>
                  <i class="fas fa-spinner fa-spin"></i>
                </span>
              </button>
            </div>
          </form>

          <!-- Login Link -->
          <div class="mt-8 text-center text-base text-gray-600">
            Remember your password? 
            <button 
              type="button"
              (click)="navigateToLogin()" 
              class="font-medium text-primary hover:text-primary/80 cursor-pointer bg-transparent border-none">
              Log in
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
    .input-field:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .password-strength {
      height: 4px;
      transition: all 0.3s ease;
    }
    .password-toggle {
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
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
    .input-error {
      border-color: #ef4444;
    }
    .input-success {
      border-color: #10b981;
    }
  `]
})
export class SetNewPasswordComponent implements OnInit {
  private isBrowser: boolean;

  formData: PasswordForm = {
    newPassword: '',
    confirmPassword: ''
  };

  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  passwordRequirements: PasswordRequirements = {
    length: false,
    number: false,
    special: false,
    case: false
  };

  passwordError = false;
  confirmPasswordError = false;
  confirmPasswordValid = false;
  passwordStrength = 0;

  features = [
    'Minimum 8 characters',
    'Numbers & special characters',
    'Uppercase & lowercase letters'
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Check if user came from password reset flow
    if (this.isBrowser) {
      const resetEmail = sessionStorage.getItem('resetEmail');
      if (!resetEmail) {
        // If no reset email in session, redirect to forgot password
        this.router.navigate(['/forgot-password']);
      }
    }
  }

  get isPasswordValid(): boolean {
    return this.passwordRequirements.length && 
           this.passwordRequirements.number && 
           this.passwordRequirements.special;
  }

  validatePassword() {
    const password = this.formData.newPassword;
    
    // Update password requirements
    this.passwordRequirements.length = password.length >= 8;
    this.passwordRequirements.number = /\d/.test(password);
    this.passwordRequirements.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.passwordRequirements.case = /[a-z]/.test(password) && /[A-Z]/.test(password);
    
    // Calculate strength
    this.passwordStrength = 0;
    if (this.passwordRequirements.length) this.passwordStrength++;
    if (this.passwordRequirements.number) this.passwordStrength++;
    if (this.passwordRequirements.special) this.passwordStrength++;
    if (this.passwordRequirements.case) this.passwordStrength++;
    
    // Set error state
    this.passwordError = password.length > 0 && !this.isPasswordValid;
    
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

    this.confirmPasswordValid = this.formData.newPassword === this.formData.confirmPassword;
    this.confirmPasswordError = !this.confirmPasswordValid;
  }

  getStrengthColor(index: number): string {
    if (index >= this.passwordStrength) {
      return '#e5e7eb'; // gray
    }
    
    if (this.passwordStrength === 1) return '#ef4444'; // red
    if (this.passwordStrength === 2) return '#f59e0b'; // yellow
    if (this.passwordStrength === 3) return '#3b82f6'; // blue
    if (this.passwordStrength === 4) return '#10b981'; // green
    
    return '#e5e7eb';
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFormValid(): boolean {
    return this.isPasswordValid && this.confirmPasswordValid && 
           !!this.formData.newPassword && !!this.formData.confirmPassword;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;

    console.log('Updating password...');

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      
      if (this.isBrowser) {
        // Clear session storage
        sessionStorage.removeItem('resetEmail');
        
        // Show success message
        alert('Password successfully updated!');
        
        // Navigate to login page
        this.router.navigate(['/login']);
      }
    }, 1500);
  }

  goBack() {
    console.log('Going back...');
    if (this.isBrowser && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/forgot-password']);
    }
  }

  navigateToLogin() {
    console.log('Navigating to login...');
    this.router.navigate(['/login']);
  }
}