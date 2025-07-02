import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthResponse, LoginCredentials, User, UserRole } from '../../model/user.model';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private demoUsers = [
    {
      email: 'admin@genworx.ai',
      password: '@admin123',
      user: {
        id: '1',
        email: 'admin@genworx.ai',
        role: UserRole.ADMIN,
        name: 'Admin User'
      }
    },
    {
      email: 'mithiesoff@gmail.com',
      password: '@Mithies2315',
      user: {
        id: '2',
        email: 'mithiesoff@gmail.com',
        role: UserRole.LEAD,
        name: 'Lead User'
      }
    },
    {
      email: 'mithiesofficial@gmail.com',
      password: '@Mithies2317',
      user: {
        id: '3',
        email: 'mithiesofficial@gmail.com',
        role: UserRole.USER,
        name: 'Teammate User'
      }
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        const user: User = JSON.parse(userData);
        this.setCurrentUser(user);
      }
    }
  }

  private storeUserData(authResponse: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
      localStorage.setItem('authToken', authResponse.token);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const demoUser = this.demoUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (demoUser) {
      const authResponse: AuthResponse = {
        user: demoUser.user,
        token: this.generateToken()
      };

      return of(authResponse).pipe(
        delay(1000),
        tap(response => {
          this.setCurrentUser(response.user);
          this.storeUserData(response);
        })
      );
    } else {
      return throwError(() => new Error('Invalid email or password'));
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}