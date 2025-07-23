import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <i class="fas fa-tasks text-indigo-600 text-xl"></i>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to GenFlow
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Task Management System
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                formControlName="email"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                   class="text-red-500 text-xs mt-1">
                Email is required and must be valid
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                formControlName="password"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                   class="text-red-500 text-xs mt-1">
                Password is required
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ errorMessage() }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="isLoading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <i class="fas fa-spinner fa-spin text-indigo-500"></i>
              </span>
              {{ isLoading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </p>
          </div>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 class="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
            <div class="space-y-1 text-xs text-blue-700">
              <p><strong>Admin:</strong> admin@genworx.ai / @Admin123</p>
              <p><strong>Team Lead:</strong> mithiesoff@gmail.com / @Mithies2315</p>
              <p><strong>User:</strong> mithiesofficial@gmail.com / @Mithies2317</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Navigation is handled in the auth service
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
        }
      });
    }
  }
}