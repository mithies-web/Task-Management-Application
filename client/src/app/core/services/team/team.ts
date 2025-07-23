import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Team {
  _id?: string;
  id?: string;
  name: string;
  department: string;
  lead?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImg?: string;
  };
  members?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImg?: string;
    status: string;
  }>;
  projects?: Array<{
    _id: string;
    name: string;
    status: string;
    progress: number;
    startDate: string;
    deadline: string;
  }>;
  description?: string;
  parentTeam?: {
    _id: string;
    name: string;
    department: string;
  };
  subTeams?: Array<{
    _id: string;
    name: string;
    department: string;
    memberCount: number;
  }>;
  performanceMetrics?: {
    taskCompletion: number;
    onTimeDelivery: number;
    qualityRating: number;
  };
  completionRate?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Virtual properties
  memberCount?: number;
  projectCount?: number;
}

export interface TeamFilters {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
  lead?: string;
  parentTeam?: string;
  isActive?: boolean;
}

export interface TeamResponse {
  success: boolean;
  data: Team[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SingleTeamResponse {
  success: boolean;
  data: Team;
  message?: string;
}

export interface CreateTeamRequest {
  name: string;
  department: string;
  lead?: string;
  description?: string;
  parentTeam?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  department?: string;
  lead?: string;
  description?: string;
  parentTeam?: string;
  performanceMetrics?: {
    taskCompletion?: number;
    onTimeDelivery?: number;
    qualityRating?: number;
  };
  completionRate?: number;
  isActive?: boolean;
}

export interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  teamsWithLeads: number;
  teamsWithoutLeads: number;
  averageTeamSize: number;
  totalMembers: number;
  newTeamsThisMonth: number;
}

export interface TeamMemberOperation {
  memberIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/admin/teams`;
  
  // State management
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();
  
  // Angular signals for reactive state
  public teamsSignal = signal<Team[]>([]);
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
    console.error('TeamService Error:', error);
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
   * Get all teams with optional filters
   */
  getAllTeams(filters?: TeamFilters): Observable<TeamResponse> {
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

    return this.http.get<TeamResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.teamsSubject.next(response.data);
          this.teamsSignal.set(response.data);
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
   * Get team by ID
   */
  getTeamById(id: string): Observable<SingleTeamResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SingleTeamResponse>(`${this.apiUrl}/${id}`, {
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
   * Create new team
   */
  createTeam(teamData: CreateTeamRequest): Observable<SingleTeamResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleTeamResponse>(this.apiUrl, teamData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add new team to current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = [response.data, ...currentTeams];
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Update existing team
   */
  updateTeam(id: string, teamData: UpdateTeamRequest): Observable<SingleTeamResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleTeamResponse>(`${this.apiUrl}/${id}`, teamData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update team in current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = currentTeams.map(team => 
            (team._id === id || team.id === id) ? response.data : team
          );
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Delete team
   */
  deleteTeam(id: string): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove team from current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = currentTeams.filter(team => 
            team._id !== id && team.id !== id
          );
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Add members to team
   */
  addTeamMembers(teamId: string, memberIds: string[]): Observable<SingleTeamResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleTeamResponse>(`${this.apiUrl}/${teamId}/add-members`, 
      { memberIds }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update team in current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = currentTeams.map(team => 
            (team._id === teamId || team.id === teamId) ? response.data : team
          );
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Remove members from team
   */
  removeTeamMembers(teamId: string, memberIds: string[]): Observable<SingleTeamResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleTeamResponse>(`${this.apiUrl}/${teamId}/remove-members`, 
      { memberIds }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update team in current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = currentTeams.map(team => 
            (team._id === teamId || team.id === teamId) ? response.data : team
          );
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Get teams by department
   */
  getTeamsByDepartment(department: string, filters?: Omit<TeamFilters, 'department'>): Observable<TeamResponse> {
    return this.getAllTeams({ ...filters, department });
  }

  /**
   * Get teams by lead
   */
  getTeamsByLead(leadId: string, filters?: Omit<TeamFilters, 'lead'>): Observable<TeamResponse> {
    return this.getAllTeams({ ...filters, lead: leadId });
  }

  /**
   * Search teams
   */
  searchTeams(searchTerm: string, filters?: Omit<TeamFilters, 'search'>): Observable<TeamResponse> {
    return this.getAllTeams({ ...filters, search: searchTerm });
  }

  /**
   * Get team statistics
   */
  getTeamStats(): Observable<TeamStats> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{success: boolean; data: TeamStats}>(`${this.apiUrl}/stats`, {
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
   * Bulk update teams
   */
  bulkUpdateTeams(teamIds: string[], updateData: Partial<UpdateTeamRequest>): Observable<{success: boolean; message: string; updated: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{success: boolean; message: string; updated: number}>(`${this.apiUrl}/bulk-update`, {
      teamIds,
      updateData
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Refresh teams list after bulk update
          this.refreshTeams();
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
   * Bulk delete teams
   */
  bulkDeleteTeams(teamIds: string[]): Observable<{success: boolean; message: string; deleted: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string; deleted: number}>(`${this.apiUrl}/bulk-delete`, {
      headers: this.getHeaders(),
      body: { teamIds }
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove deleted teams from current teams
          const currentTeams = this.teamsSubject.value;
          const updatedTeams = currentTeams.filter(team => 
            !teamIds.includes(team._id || '') && !teamIds.includes(team.id || '')
          );
          this.teamsSubject.next(updatedTeams);
          this.teamsSignal.set(updatedTeams);
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
   * Export teams data
   */
  exportTeams(format: 'csv' | 'excel' = 'csv', filters?: TeamFilters): Observable<Blob> {
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
   * Get current teams from state
   */
  getCurrentTeams(): Team[] {
    return this.teamsSubject.value;
  }

  /**
   * Clear teams state
   */
  clearTeams(): void {
    this.teamsSubject.next([]);
    this.teamsSignal.set([]);
    this.errorSignal.set(null);
  }

  /**
   * Refresh teams (reload current filter)
   */
  refreshTeams(filters?: TeamFilters): Observable<TeamResponse> {
    return this.getAllTeams(filters);
  }

  // Utility methods for team management

  /**
   * Get department color
   */
  getDepartmentColor(department: string): string {
    const colors: { [key: string]: string } = {
      'Engineering': 'text-blue-600',
      'Design': 'text-purple-600',
      'Marketing': 'text-green-600',
      'Sales': 'text-orange-600',
      'HR': 'text-pink-600',
      'Finance': 'text-yellow-600',
      'Operations': 'text-gray-600'
    };
    return colors[department] || 'text-gray-600';
  }

  /**
   * Get team status color
   */
  getTeamStatusColor(isActive: boolean): string {
    return isActive ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Get department badge class
   */
  getDepartmentBadgeClass(department: string): string {
    const classes: { [key: string]: string } = {
      'Engineering': 'bg-blue-100 text-blue-800',
      'Design': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-green-100 text-green-800',
      'Sales': 'bg-orange-100 text-orange-800',
      'HR': 'bg-pink-100 text-pink-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Operations': 'bg-gray-100 text-gray-800'
    };
    return classes[department] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get team status badge class
   */
  getTeamStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  /**
   * Format team display name
   */
  formatTeamDisplayName(team: Team): string {
    return team.name || 'Unknown Team';
  }

  /**
   * Get team performance color
   */
  getPerformanceColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Calculate team efficiency
   */
  calculateTeamEfficiency(team: Team): number {
    if (!team.performanceMetrics) return 0;
    const { taskCompletion, onTimeDelivery, qualityRating } = team.performanceMetrics;
    return Math.round((taskCompletion + onTimeDelivery + (qualityRating * 20)) / 3);
  }

  /**
   * Check if team has lead
   */
  hasTeamLead(team: Team): boolean {
    return !!(team.lead && team.lead._id);
  }

  /**
   * Get team size category
   */
  getTeamSizeCategory(memberCount: number): string {
    if (memberCount <= 3) return 'Small';
    if (memberCount <= 8) return 'Medium';
    if (memberCount <= 15) return 'Large';
    return 'Enterprise';
  }

  /**
   * Get team hierarchy level
   */
  getTeamHierarchyLevel(team: Team): string {
    if (team.parentTeam && team.subTeams && team.subTeams.length > 0) {
      return 'Middle';
    } else if (team.parentTeam) {
      return 'Child';
    } else if (team.subTeams && team.subTeams.length > 0) {
      return 'Parent';
    }
    return 'Standalone';
  }
}