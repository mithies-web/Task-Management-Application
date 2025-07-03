import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { Auth } from '../../core/services/auth/auth';
import { throwError } from 'rxjs';
import { UserRole } from '../../model/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  image: string = 'public/logo/logo-black.png';
  illustration: string = 'public/logo/full-logo.png';
  loginForm: FormGroup;
  showPassword = false;
  loginError = false;
  isLoading = false;

  features = [
    'Team Collaboration', 
    'Smart Prioritization',
    'Real-time Updates'
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.loginError = false;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError((error) => {
          this.loginError = true;
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          window.location.href = this.getRedirectUrl(response.user.role);
        },
        error: () => {
          this.loginError = true;
        }
      });
  }

  private getRedirectUrl(role: UserRole): string {
    switch(role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.LEAD:
        return '/lead/dashboard';
      case UserRole.USER:
        return '/user/dashboard';
      default:
        return '/';
    }
  }
}