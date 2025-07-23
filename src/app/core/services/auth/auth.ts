import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { AuthResponse, Team, User, UserRole } from '../../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:5000/api';

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Demo users for local testing
  private demoUsers = [
    {
      email: 'admin@genworx.ai',
      password: '@admin123',
      user: {
        id: 'admin-001',
        _id: 'admin-001',
        numericalId: 1001,
        name: 'Admin User',
        username: 'admin',
        email: 'admin@genworx.ai',
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        phone: '+1234567890',
        gender: 'Other',
        dob: '1990-01-01',
        department: 'Administration',
        team: null,
        employeeType: 'Full-time',
        location: 'HQ',
        address: '123 Admin St',
        about: 'System Administrator',
        profileImg: 'public/assets/profile-placeholder.png',
        password: '',
        notifications: [],
          performance: {
            taskCompletion: 95,
            onTimeDelivery: 90,
            qualityRating: 85,
            projects: ['Project-X']
          },
          completionRate: 98
      }
    },
    {
      email: 'mithiesoff@gmail.com',
      password: '@Mithies2315',
      user: {
        id: 'lead-001',
        _id: 'lead-001',
        numericalId: 2001,
        name: 'Team Lead',
        username: 'teamlead',
        email: 'mithiesoff@gmail.com',
        role: UserRole.LEAD,
        status: 'ACTIVE',
        phone: '+1234567891',
        gender: 'Male',
        dob: '1988-05-15',
        department: 'Development',
        team: 'team-001',
        employeeType: 'Full-time',
        location: 'Office',
        address: '456 Lead Ave',
        about: 'Development Team Lead',
        profileImg: 'public/assets/profile-placeholder.png',
        password: '',
        notifications: [],
          performance: {
            taskCompletion: 92,
            onTimeDelivery: 88,
            qualityRating: 80,
            projects: ['Project-Y']
          },
          completionRate: 94
      }
    },
    {
      email: 'mithiesofficial@gmail.com',
      password: '@Mithies2317',
      user: {
        id: 'user-001',
        _id: 'user-001',
        numericalId: 3001,
        name: 'Team Member',
        username: 'member',
        email: 'mithiesofficial@gmail.com',
        role: UserRole.USER,
        status: 'ACTIVE',
        phone: '+1234567892',
        gender: 'Female',
        dob: '1992-08-20',
        department: 'Development',
        team: 'team-001',
        employeeType: 'Full-time',
        location: 'Remote',
        address: '789 Member Blvd',
        about: 'Software Developer',
        profileImg: 'public/assets/profile-placeholder.png',
        password: '',
        notifications: [],
          performance: {
            taskCompletion: 88,
            onTimeDelivery: 85,
            qualityRating: 78,
            projects: ['Project-Z']
          },
          completionRate: 90
      }
    }
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadCurrentUserFromStorage();
  }

  // Helper to check if we're in browser environment
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Helper to get authentication token from storage
  private getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // Helper to create authenticated HTTP headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken(); // Retrieve token
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '' // Attach as Bearer token
    });
  }

  // Loads current user data from storage on service initialization
  private loadCurrentUserFromStorage(): void {
    if (!this.isBrowser()) return;
    
    const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        this.logout(); // Clear corrupted data
      }
    }
  }

  // Admin: Get all users from the backend
  adminGetAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers: this.getAuthHeaders() }).pipe(
      map(users => users.map(user => this.mapApiUserToUser(user))),
      catchError(error => {
        console.error('AdminGetAllUsers failed:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users.'));
      })
    );
  }

  // Admin: Create a new user via backend API
  adminCreateUser(userData: Partial<User>): Observable<User> {
    // Ensure `_id` is not sent, as MongoDB will generate it.
    // The backend's pre-save hook will generate numericalId.
    const payload = { ...userData };
    delete payload.id; // Remove frontend 'id' as backend uses '_id'
    delete payload._id; // Ensure _id is not sent

    return this.http.post<any>(`${this.apiUrl}/admin/users`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(apiUser => this.mapApiUserToUser(apiUser)), // Map the backend response to frontend User model
      catchError(error => {
        console.error('AdminCreateUser failed:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create user.'));
      })
    );
  }

  // Admin: Update an existing user via backend API
  adminUpdateUser(id: string, userData: Partial<User>): Observable<User> {
    // Only send updatable fields.
    const payload = { ...userData };
    delete payload.id; // Remove frontend 'id' from payload
    delete payload.numericalId; // numericalId shouldn't be updated via this route

    return this.http.put<any>(`${this.apiUrl}/admin/users/${id}`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(apiUser => this.mapApiUserToUser(apiUser)), // Map the backend response to frontend User model
      catchError(error => {
        console.error('AdminUpdateUser failed:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update user.'));
      })
    );
  }

  // Admin: Delete a user via backend API
  adminDeleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('AdminDeleteUser failed:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete user.'));
      })
    );
  }

  // Maps backend API user response to the frontend User interface
  private mapApiUserToUser(apiUser: any): User {
    return {
      id: apiUser._id, // Map MongoDB's _id to frontend's id
      _id: apiUser._id, // Also keep _id for consistency if needed, though 'id' is primary for frontend
      numericalId: apiUser.numericalId,
      name: apiUser.name,
      username: apiUser.username,
      email: apiUser.email,
      role: apiUser.role,
      status: apiUser.status,
      phone: apiUser.phone,
      gender: apiUser.gender,
      dob: apiUser.dob,
      department: apiUser.department,
      // Ensure 'team' is always a string ID or null, regardless of how backend sends it (populated or just ID)
      team: (apiUser.team && typeof apiUser.team === 'object' && apiUser.team._id)
              ? apiUser.team._id.toString()
              : (apiUser.team ? apiUser.team.toString() : null),
      employeeType: apiUser.employeeType,
      location: apiUser.location,
      address: apiUser.address,
      about: apiUser.about,
      profileImg: apiUser.profileImg,
      password: '', // Never store or expect password in frontend User object from API responses
      notifications: apiUser.notifications,
      performance: apiUser.performance,
      completionRate: apiUser.completionRate,
    };
  }

  // Get current user from BehaviorSubject
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Logs out user by clearing stored token and user data
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  // Checks if the current user has a specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Checks if the user is authenticated (token and user object present)
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  // Checks if the current user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Registers a new user
  registerUser(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, user).pipe(
      tap(response => {
        // Map the AuthResponse to a User object for storage (optional, usually navigate to login)
        const registeredUser: User = {
          id: response._id,
          _id: response._id, // Keep _id from backend
          numericalId: response.numericalId,
          name: response.name,
          username: response.username,
          email: response.email,
          role: response.role,
          status: response.status,
          profileImg: response.profileImg,
          password: '', // Password not stored here
          team: response.team // Assuming team is sent as ID string in AuthResponse
        };
        // You might choose not to store the user after registration and instead navigate to login page.
        // If you do, ensure it doesn't auto-login unless intended.
        // Example: this.storeUserData(response, false);
      }),
      catchError(error => {
        console.error('RegisterUser failed:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed.'));
      })
    );
  }

  // Logs in a user and stores their data and token (Local Storage Version)
  login(credentials: { email: string; password: string }, rememberMe: boolean): Observable<AuthResponse> {
    return new Observable<AuthResponse>((observer) => {
      // Simulate async operation with setTimeout
      setTimeout(() => {
        console.log('Attempting login with credentials:', credentials);
        console.log('Available demo users:', this.demoUsers.map(u => ({ email: u.email, password: u.password })));
        
        const matchingUser = this.demoUsers.find(user => {
          console.log(`Comparing: ${user.email} === ${credentials.email} && ${user.password} === ${credentials.password}`);
          return user.email === credentials.email && user.password === credentials.password;
        });

        if (matchingUser) {
          const loggedInUser: User = { ...matchingUser.user };
          const token = `mock-token-${Date.now()}`;

          // Store token
          if (this.isBrowser()) {
            if (rememberMe) {
              localStorage.setItem('authToken', token);
              localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            } else {
              sessionStorage.setItem('authToken', token);
              sessionStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            }
          }

          this.currentUserSubject.next(loggedInUser);
          
          // Create AuthResponse object
          const authResponse: AuthResponse = {
            token,
            _id: loggedInUser._id!,
            numericalId: loggedInUser.numericalId!,
            name: loggedInUser.name,
            username: loggedInUser.username!,
            email: loggedInUser.email,
            role: loggedInUser.role,
            status: loggedInUser.status,
            user: loggedInUser,
            phone: loggedInUser.phone,
            gender: loggedInUser.gender,
            dob: loggedInUser.dob,
            department: loggedInUser.department,
            team: loggedInUser.team,
            employeeType: loggedInUser.employeeType,
            location: loggedInUser.location,
            address: loggedInUser.address,
            about: loggedInUser.about,
            profileImg: loggedInUser.profileImg,
            notifications: loggedInUser.notifications,
            performance: loggedInUser.performance,
            completionRate: loggedInUser.completionRate
          };

          observer.next(authResponse);
          observer.complete();
        } else {
          observer.error(new Error('Invalid credentials.'));
        }
      }, 1000); // Simulate network delay
    }).pipe(
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error(error.message || 'Invalid credentials.'));
      })
    );
  }

  // Team methods should use '/admin/teams' as the base path
  adminGetAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/admin/teams`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Failed to fetch teams:', error);
        return throwError(() => new Error('Failed to fetch teams'));
      })
    );
  }

  adminGetTeamById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/admin/teams/${id}`, { headers: this.getAuthHeaders() });
  }

  adminCreateTeam(teamData: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/admin/teams`, teamData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Failed to create team:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create team'));
      })
    );
  }

  adminUpdateTeam(id: string, teamData: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/admin/teams/${id}`, teamData, { headers: this.getAuthHeaders() }).pipe(
      map(team => this.mapApiTeamToTeam(team))
    );
  }

  adminDeleteTeam(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/teams/${id}`, { headers: this.getAuthHeaders() });
  }

  adminAddTeamMembers(teamId: string, memberIds: string[]): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/admin/teams/${teamId}/add-members`, { memberIds }, { headers: this.getAuthHeaders() }).pipe(
      map(team => this.mapApiTeamToTeam(team))
    );
  }

  adminRemoveTeamMembers(teamId: string, memberIds: string[]): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/admin/teams/${teamId}/remove-members`, { memberIds }, { headers: this.getAuthHeaders() }).pipe(
      map(team => this.mapApiTeamToTeam(team))
    );
  }

  private mapApiTeamToTeam(apiTeam: any): Team {
    return {
      id: apiTeam._id || apiTeam.id,
      name: apiTeam.name,
      department: apiTeam.department,
      lead: apiTeam.lead?._id || apiTeam.lead,
      members: apiTeam.membersCount || (apiTeam.members ? apiTeam.members.length : 0),
      projects: apiTeam.projectsCount || (apiTeam.projects ? apiTeam.projects.length : 0),
      completionRate: apiTeam.completionRate || 0,
      description: apiTeam.description,
      parentTeam: apiTeam.parentTeam?._id || apiTeam.parentTeam,
      subTeams: apiTeam.subTeams?.map((sub: any) => sub._id || sub) || [],
      leadDetails: apiTeam.lead,
      memberDetails: apiTeam.members,
      projectDetails: apiTeam.projects,
      createdAt: apiTeam.createdAt,
      updatedAt: apiTeam.updatedAt
    };
  }
}