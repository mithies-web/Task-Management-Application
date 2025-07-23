import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User } from '../../../model/user.model';

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  team?: string;
  department?: string;
}

export interface UserResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'team-lead' | 'user';
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  team?: string;
  employeeType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  location?: 'office' | 'remote' | 'hybrid';
  address?: string;
  about?: string;
  profileImg?: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'team-lead' | 'user';
  status?: 'active' | 'inactive' | 'suspended' | 'on-leave';
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  team?: string;
  employeeType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  location?: 'office' | 'remote' | 'hybrid';
  address?: string;
  about?: string;
  profileImg?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  teamLeadUsers: number;
  regularUsers: number;
  newUsersThisMonth: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/users`;
  
  // State management
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  // Angular signals for reactive state
  public usersSignal = signal<User[]>([]);
  public loadingSignal = signal<boolean>(false);
  public errorSignal = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get HTTP headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('genflow_auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('UserService Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.errorSignal.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get all users with optional filters
   */
  getAllUsers(filters?: UserFilters): Observable<UserResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<UserResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.usersSubject.next(response.data);
          this.usersSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<SingleUserResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SingleUserResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Create new user
   */
  createUser(userData: CreateUserRequest): Observable<SingleUserResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleUserResponse>(this.apiUrl, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add new user to current users
          const currentUsers = this.usersSubject.value;
          const updatedUsers = [response.data, ...currentUsers];
          this.usersSubject.next(updatedUsers);
          this.usersSignal.set(updatedUsers);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Update existing user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<SingleUserResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleUserResponse>(`${this.apiUrl}/${id}`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update user in current users
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.map(user => 
            (user._id === id || user.id === id) ? response.data : user
          );
          this.usersSubject.next(updatedUsers);
          this.usersSignal.set(updatedUsers);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove user from current users
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.filter(user => 
            user._id !== id && user.id !== id
          );
          this.usersSubject.next(updatedUsers);
          this.usersSignal.set(updatedUsers);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string, filters?: Omit<UserFilters, 'role'>): Observable<UserResponse> {
    return this.getAllUsers({ ...filters, role });
  }

  /**
   * Get users by status
   */
  getUsersByStatus(status: string, filters?: Omit<UserFilters, 'status'>): Observable<UserResponse> {
    return this.getAllUsers({ ...filters, status });
  }

  /**
   * Get users by team
   */
  getUsersByTeam(teamId: string, filters?: Omit<UserFilters, 'team'>): Observable<UserResponse> {
    return this.getAllUsers({ ...filters, team: teamId });
  }

  /**
   * Get users by department
   */
  getUsersByDepartment(department: string, filters?: Omit<UserFilters, 'department'>): Observable<UserResponse> {
    return this.getAllUsers({ ...filters, department });
  }

  /**
   * Search users
   */
  searchUsers(searchTerm: string, filters?: Omit<UserFilters, 'search'>): Observable<UserResponse> {
    return this.getAllUsers({ ...filters, search: searchTerm });
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{success: boolean; data: UserStats}>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Bulk update users
   */
  bulkUpdateUsers(userIds: string[], updateData: Partial<UpdateUserRequest>): Observable<{success: boolean; message: string; updated: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{success: boolean; message: string; updated: number}>(`${this.apiUrl}/bulk-update`, {
      userIds,
      updateData
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Refresh users list after bulk update
          this.refreshUsers();
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Bulk delete users
   */
  bulkDeleteUsers(userIds: string[]): Observable<{success: boolean; message: string; deleted: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string; deleted: number}>(`${this.apiUrl}/bulk-delete`, {
      headers: this.getHeaders(),
      body: { userIds }
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove deleted users from current users
          const currentUsers = this.usersSubject.value;
          const updatedUsers = currentUsers.filter(user => 
            !userIds.includes(user._id || '') && !userIds.includes(user.id || '')
          );
          this.usersSubject.next(updatedUsers);
          this.usersSignal.set(updatedUsers);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Export users data
   */
  exportUsers(format: 'csv' | 'excel' = 'csv', filters?: UserFilters): Observable<Blob> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/export`, {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    }).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get current users from state
   */
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  /**
   * Clear users state
   */
  clearUsers(): void {
    this.usersSubject.next([]);
    this.usersSignal.set([]);
    this.errorSignal.set(null);
  }

  /**
   * Refresh users (reload current filter)
   */
  refreshUsers(filters?: UserFilters): Observable<UserResponse> {
    return this.getAllUsers(filters);
  }

  // Utility methods for user management

  /**
   * Get user role color
   */
  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'team-lead': return 'text-blue-600';
      case 'user': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get user status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      case 'on-leave': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get user role badge class
   */
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'team-lead': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get user status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format user display name
   */
  formatUserDisplayName(user: User): string {
    return user.name || user.username || user.email || 'Unknown User';
  }

  /**
   * Check if user is online (based on lastActive)
   */
  isUserOnline(user: User): boolean {
    if (!user.lastActive) return false;
    const lastActive = new Date(user.lastActive);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    return diffMinutes <= 5; // Consider online if active within 5 minutes
  }

  /**
   * Get user avatar URL or initials
   */
  getUserAvatar(user: User): string {
    if (user.profileImg) {
      return user.profileImg;
    }
    // Return initials as fallback
    const name = this.formatUserDisplayName(user);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#6366f1"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">
          ${initials.substring(0, 2)}
        </text>
      </svg>
    `)}`;
  }
}