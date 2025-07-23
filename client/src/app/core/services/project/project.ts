import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  team: {
    _id: string;
    name: string;
    department: string;
  };
  lead: {
    _id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
  teamMembers?: Array<{
    _id: string;
    name: string;
    email: string;
    profileImg?: string;
    role: string;
  }>;
  startDate: string;
  endDate: string;
  deadline: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  tags?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
    uploadedAt: string;
  }>;
  milestones?: Array<{
    name: string;
    description: string;
    dueDate: string;
    completed: boolean;
    completedAt?: string;
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Virtual properties
  daysRemaining?: number;
  budgetUtilization?: number;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  team?: string;
  lead?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SingleProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  team: string;
  lead: string;
  startDate: string;
  endDate: string;
  deadline: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  budget?: {
    allocated: number;
    currency?: string;
  };
  tags?: string[];
  milestones?: Array<{
    name: string;
    description?: string;
    dueDate: string;
  }>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  budget?: {
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  tags?: string[];
  milestones?: Array<{
    name: string;
    description?: string;
    dueDate: string;
    completed?: boolean;
    completedAt?: string;
  }>;
  isActive?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  cancelledProjects: number;
  overbudgetProjects: number;
  overdueProjects: number;
  averageProgress: number;
  newProjectsThisMonth: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;
  
  // State management
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();
  
  // Angular signals for reactive state
  public projectsSignal = signal<Project[]>([]);
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
    console.error('ProjectService Error:', error);
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
   * Get all projects with optional filters
   */
  getAllProjects(filters?: ProjectFilters): Observable<ProjectResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ProjectResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.projectsSubject.next(response.data);
          this.projectsSignal.set(response.data);
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
   * Get project by ID
   */
  getProjectById(id: string): Observable<SingleProjectResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SingleProjectResponse>(`${this.apiUrl}/${id}`, {
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
   * Create new project
   */
  createProject(projectData: CreateProjectRequest): Observable<SingleProjectResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleProjectResponse>(this.apiUrl, projectData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add new project to current projects
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = [response.data, ...currentProjects];
          this.projectsSubject.next(updatedProjects);
          this.projectsSignal.set(updatedProjects);
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
   * Update existing project
   */
  updateProject(id: string, projectData: UpdateProjectRequest): Observable<SingleProjectResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleProjectResponse>(`${this.apiUrl}/${id}`, projectData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update project in current projects
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = currentProjects.map(project => 
            (project._id === id || project.id === id) ? response.data : project
          );
          this.projectsSubject.next(updatedProjects);
          this.projectsSignal.set(updatedProjects);
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
   * Delete project
   */
  deleteProject(id: string): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove project from current projects
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = currentProjects.filter(project => 
            project._id !== id && project.id !== id
          );
          this.projectsSubject.next(updatedProjects);
          this.projectsSignal.set(updatedProjects);
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
   * Update project team members
   */
  updateProjectMembers(projectId: string, teamMembers: string[]): Observable<SingleProjectResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleProjectResponse>(`${this.apiUrl}/${projectId}/members`, 
      { teamMembers }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update project in current projects
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = currentProjects.map(project => 
            (project._id === projectId || project.id === projectId) ? response.data : project
          );
          this.projectsSubject.next(updatedProjects);
          this.projectsSignal.set(updatedProjects);
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
   * Get projects by team
   */
  getProjectsByTeam(teamId: string, filters?: Omit<ProjectFilters, 'team'>): Observable<ProjectResponse> {
    return this.getAllProjects({ ...filters, team: teamId });
  }

  /**
   * Get projects by status
   */
  getProjectsByStatus(status: string, filters?: Omit<ProjectFilters, 'status'>): Observable<ProjectResponse> {
    return this.getAllProjects({ ...filters, status });
  }

  /**
   * Get projects by priority
   */
  getProjectsByPriority(priority: string, filters?: Omit<ProjectFilters, 'priority'>): Observable<ProjectResponse> {
    return this.getAllProjects({ ...filters, priority });
  }

  /**
   * Get projects by lead
   */
  getProjectsByLead(leadId: string, filters?: Omit<ProjectFilters, 'lead'>): Observable<ProjectResponse> {
    return this.getAllProjects({ ...filters, lead: leadId });
  }

  /**
   * Search projects
   */
  searchProjects(searchTerm: string, filters?: Omit<ProjectFilters, 'search'>): Observable<ProjectResponse> {
    return this.getAllProjects({ ...filters, search: searchTerm });
  }

  /**
   * Get project statistics
   */
  getProjectStats(): Observable<ProjectStats> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{success: boolean; data: ProjectStats}>(`${this.apiUrl}/stats`, {
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
   * Bulk update projects
   */
  bulkUpdateProjects(projectIds: string[], updateData: Partial<UpdateProjectRequest>): Observable<{success: boolean; message: string; updated: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{success: boolean; message: string; updated: number}>(`${this.apiUrl}/bulk-update`, {
      projectIds,
      updateData
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Refresh projects list after bulk update
          this.refreshProjects();
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
   * Bulk delete projects
   */
  bulkDeleteProjects(projectIds: string[]): Observable<{success: boolean; message: string; deleted: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string; deleted: number}>(`${this.apiUrl}/bulk-delete`, {
      headers: this.getHeaders(),
      body: { projectIds }
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove deleted projects from current projects
          const currentProjects = this.projectsSubject.value;
          const updatedProjects = currentProjects.filter(project => 
            !projectIds.includes(project._id || '') && !projectIds.includes(project.id || '')
          );
          this.projectsSubject.next(updatedProjects);
          this.projectsSignal.set(updatedProjects);
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
   * Export projects data
   */
  exportProjects(format: 'csv' | 'excel' = 'csv', filters?: ProjectFilters): Observable<Blob> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams().set('format', format);
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v));
          } else {
            params = params.set(key, value.toString());
          }
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
   * Get current projects from state
   */
  getCurrentProjects(): Project[] {
    return this.projectsSubject.value;
  }

  /**
   * Clear projects state
   */
  clearProjects(): void {
    this.projectsSubject.next([]);
    this.projectsSignal.set([]);
    this.errorSignal.set(null);
  }

  /**
   * Refresh projects (reload current filter)
   */
  refreshProjects(filters?: ProjectFilters): Observable<ProjectResponse> {
    return this.getAllProjects(filters);
  }

  // Utility methods for project management

  /**
   * Get project status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'not-started': return 'text-gray-600';
      case 'in-progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'on-hold': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get project priority color
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get project status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get project priority badge class
   */
  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Check if project is overdue
   */
  isProjectOverdue(project: Project): boolean {
    if (project.status === 'completed' || !project.deadline) return false;
    return new Date() > new Date(project.deadline);
  }

  /**
   * Get project progress color
   */
  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Calculate days remaining
   */
  calculateDaysRemaining(project: Project): number {
    if (!project.deadline) return 0;
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate budget utilization percentage
   */
  calculateBudgetUtilization(project: Project): number {
    if (!project.budget?.allocated || project.budget.allocated === 0) return 0;
    return Math.round((project.budget.spent / project.budget.allocated) * 100);
  }

  /**
   * Format project display name
   */
  formatProjectDisplayName(project: Project): string {
    return project.name || 'Unknown Project';
  }

  /**
   * Get project health status
   */
  getProjectHealth(project: Project): 'excellent' | 'good' | 'warning' | 'critical' {
    const isOverdue = this.isProjectOverdue(project);
    const budgetUtilization = this.calculateBudgetUtilization(project);
    const progress = project.progress;

    if (isOverdue || budgetUtilization > 100) return 'critical';
    if (progress < 50 && budgetUtilization > 80) return 'warning';
    if (progress >= 80 && budgetUtilization <= 80) return 'excellent';
    return 'good';
  }

  /**
   * Get project completion estimate
   */
  getCompletionEstimate(project: Project): string {
    const daysRemaining = this.calculateDaysRemaining(project);
    const progress = project.progress;
    
    if (progress === 100) return 'Completed';
    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  }
}