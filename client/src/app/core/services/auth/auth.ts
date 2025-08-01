import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../../model/user.model';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  _id?: string;
  numericalId?: number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  team?: string;
  employeeType?: string;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  address?: string;
  about?: string;
  profileImg?: string;
  notifications?: any[];
  performance?: any;
  completionRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'genflow_auth_token';
  private userKey = 'genflow_current_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signals for reactive state management
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  userRole = signal<string>('');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const storedUser = this.getStoredUser();
    
    if (token && storedUser) {
      this.setCurrentUser(storedUser);
      // Optionally verify token with backend
      this.verifyToken().subscribe({
        next: (user) => {
          this.setCurrentUser(user);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setStoredUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private removeStoredUser(): void {
    localStorage.removeItem(this.userKey);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private setCurrentUser(user: User): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.userRole.set(user.role);
    this.setStoredUser(user);
  }

  private clearCurrentUser(): void {
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.userRole.set('');
    this.removeStoredUser();
    this.removeToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
            
            // Create user object from response
            const user: User = {
              _id: response._id || '',
              numericalId: response.numericalId || 0,
              name: response.name || '',
              username: response.username || '',
              email: response.email || '',
              role: response.role || 'user',
              status: response.status || 'active',
              phone: response.phone || '',
              gender: response.gender || '',
              dob: response.dob || '',
              department: response.department || '',
              team: response.team || null,
              employeeType: response.employeeType || 'full-time',
              location: response.location || 'office',
              joinDate: response.joinDate || '',
              lastActive: response.lastActive || '',
              address: response.address || '',
              about: response.about || '',
              profileImg: response.profileImg || '',
              notifications: response.notifications || [],
              performance: response.performance || { taskCompletion: 0, onTimeDelivery: 0, qualityRating: 0, projects: [] },
              completionRate: response.completionRate || 0,
              password: '' // Never store password
            };
            
            this.setCurrentUser(user);
            this.routeByRole(user.role);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  registerUser(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
            
            // Create user object from response
            const user: User = {
              _id: response._id || '',
              numericalId: response.numericalId || 0,
              name: response.name || '',
              username: response.username || '',
              email: response.email || '',
              role: response.role || 'user',
              status: response.status || 'active',
              phone: '',
              gender: '',
              dob: '',
              department: '',
              team: null,
              employeeType: 'full-time',
              location: 'office',
              joinDate: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              address: '',
              about: '',
              profileImg: response.profileImg || '',
              notifications: [],
              performance: { taskCompletion: 0, onTimeDelivery: 0, qualityRating: 0, projects: [] },
              completionRate: 0,
              password: ''
            };
            
            this.setCurrentUser(user);
          }
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  verifyToken(): Observable<User> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.user),
      catchError(error => {
        console.error('Token verification error:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(profileData: Partial<User>): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/auth/profile`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      catchError(error => {
        console.error('Profile update error:', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Password change error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearCurrentUser();
    this.router.navigate(['/auth/login']);
  }

  private routeByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'manager':
        this.router.navigate(['/manager/dashboard']);
        break;
      case 'user':
      default:
        this.router.navigate(['/user/dashboard']);
        break;
    }
  }

  // Admin methods for user management
  adminGetAllUsers(params?: any): Observable<{ success: boolean; data: User[]; pagination?: any }> {
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams(params);
      queryParams = '?' + searchParams.toString();
    }
    
    return this.http.get<{ success: boolean; data: User[]; pagination?: any }>(
      `${this.apiUrl}/admin/users${queryParams}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Get users error:', error);
        return throwError(() => error);
      })
    );
  }

  adminGetUserById(id: string): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(
      `${this.apiUrl}/admin/users/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Get user error:', error);
        return throwError(() => error);
      })
    );
  }

  adminCreateUser(userData: RegisterRequest): Observable<{ success: boolean; message: string; data: User }> {
    return this.http.post<{ success: boolean; message: string; data: User }>(
      `${this.apiUrl}/admin/users`,
      userData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Create user error:', error);
        return throwError(() => error);
      })
    );
  }

  adminUpdateUser(userId: string, userData: Partial<User>): Observable<{ success: boolean; message: string; data: User }> {
    return this.http.put<{ success: boolean; message: string; data: User }>(
      `${this.apiUrl}/admin/users/${userId}`,
      userData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        // Update current user if it's the same user
        if (response.success && this.currentUser()?._id === userId) {
          this.setCurrentUser(response.data);
        }
      }),
      catchError(error => {
        console.error('Update user error:', error);
        return throwError(() => error);
      })
    );
  }

  adminDeleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Delete user error:', error);
        return throwError(() => error);
      })
    );
  }

  // Team management methods
  adminGetAllTeams(params?: any): Observable<{ success: boolean; data: any[]; pagination?: any }> {
    let queryParams = '';
    if (params) {
      const searchParams = new URLSearchParams(params);
      queryParams = '?' + searchParams.toString();
    }
    
    return this.http.get<{ success: boolean; data: any[]; pagination?: any }>(
      `${this.apiUrl}/admin/teams${queryParams}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Get teams error:', error);
        return throwError(() => error);
      })
    );
  }

  adminGetTeamById(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/admin/teams/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Get team error:', error);
        return throwError(() => error);
      })
    );
  }

  adminCreateTeam(teamData: any): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admin/teams`,
      teamData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Create team error:', error);
        return throwError(() => error);
      })
    );
  }

  adminUpdateTeam(teamId: string, teamData: any): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admin/teams/${teamId}`,
      teamData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Update team error:', error);
        return throwError(() => error);
      })
    );
  }

  adminDeleteTeam(teamId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/teams/${teamId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Delete team error:', error);
        return throwError(() => error);
      })
    );
  }

  adminAddTeamMembers(teamId: string, memberIds: string[]): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admin/teams/${teamId}/add-members`,
      { memberIds },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Add team members error:', error);
        return throwError(() => error);
      })
    );
  }

  adminRemoveTeamMembers(teamId: string, memberIds: string[]): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/admin/teams/${teamId}/remove-members`,
      { memberIds },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Remove team members error:', error);
        return throwError(() => error);
      })
    );
  }
}