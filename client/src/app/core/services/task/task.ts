import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  assignee?: string;
  createdBy: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completionDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  progress: number;
  storyPoints?: number;
  sprintId?: string;
  tags?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    uploadedBy?: string;
    uploadedAt?: string;
  }>;
  comments?: Array<{
    author: string;
    content: string;
    createdAt: string;
  }>;
  dependencies?: Array<{
    taskId: string;
    type: 'blocks' | 'blocked-by' | 'related';
  }>;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Virtual properties
  project?: any;
  isOverdue?: boolean;
  timeRemaining?: number;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  sprintId?: string;
  search?: string;
}

export interface TaskResponse {
  success: boolean;
  data: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SingleTaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  startTime?: string;
  endTime?: string;
  storyPoints?: number;
  sprintId?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  startTime?: string;
  endTime?: string;
  progress?: number;
  storyPoints?: number;
  sprintId?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  
  // State management
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  
  // Angular signals for reactive state
  public tasksSignal = signal<Task[]>([]);
  public loadingSignal = signal<boolean>(false);
  public errorSignal = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get HTTP headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('TaskService Error:', error);
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
   * Get all tasks with optional filters
   */
  getAllTasks(filters?: TaskFilters): Observable<TaskResponse> {
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

    return this.http.get<TaskResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tasksSubject.next(response.data);
          this.tasksSignal.set(response.data);
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
   * Get task by ID
   */
  getTaskById(id: string): Observable<SingleTaskResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SingleTaskResponse>(`${this.apiUrl}/${id}`, {
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
   * Create new task
   */
  createTask(taskData: CreateTaskRequest): Observable<SingleTaskResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleTaskResponse>(this.apiUrl, taskData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add new task to current tasks
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = [response.data, ...currentTasks];
          this.tasksSubject.next(updatedTasks);
          this.tasksSignal.set(updatedTasks);
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
   * Update existing task
   */
  updateTask(id: string, taskData: UpdateTaskRequest): Observable<SingleTaskResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleTaskResponse>(`${this.apiUrl}/${id}`, taskData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update task in current tasks
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            (task._id === id || task.id === id) ? response.data : task
          );
          this.tasksSubject.next(updatedTasks);
          this.tasksSignal.set(updatedTasks);
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
   * Delete task
   */
  deleteTask(id: string): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove task from current tasks
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.filter(task => 
            task._id !== id && task.id !== id
          );
          this.tasksSubject.next(updatedTasks);
          this.tasksSignal.set(updatedTasks);
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
   * Add comment to task
   */
  addComment(taskId: string, content: string): Observable<SingleTaskResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleTaskResponse>(`${this.apiUrl}/${taskId}/comments`, 
      { content }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update task in current tasks
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            (task._id === taskId || task.id === taskId) ? response.data : task
          );
          this.tasksSubject.next(updatedTasks);
          this.tasksSignal.set(updatedTasks);
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
   * Update task progress
   */
  updateTaskProgress(taskId: string, progress: number): Observable<SingleTaskResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleTaskResponse>(`${this.apiUrl}/${taskId}/progress`, 
      { progress }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update task in current tasks
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            (task._id === taskId || task.id === taskId) ? response.data : task
          );
          this.tasksSubject.next(updatedTasks);
          this.tasksSignal.set(updatedTasks);
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
   * Get tasks by project ID
   */
  getTasksByProject(projectId: string, filters?: Omit<TaskFilters, 'projectId'>): Observable<TaskResponse> {
    return this.getAllTasks({ ...filters, projectId });
  }

  /**
   * Get tasks by assignee ID
   */
  getTasksByAssignee(assigneeId: string, filters?: Omit<TaskFilters, 'assigneeId'>): Observable<TaskResponse> {
    return this.getAllTasks({ ...filters, assigneeId });
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: string, filters?: Omit<TaskFilters, 'status'>): Observable<TaskResponse> {
    return this.getAllTasks({ ...filters, status });
  }

  /**
   * Get tasks by sprint ID
   */
  getTasksBySprint(sprintId: string, filters?: Omit<TaskFilters, 'sprintId'>): Observable<TaskResponse> {
    return this.getAllTasks({ ...filters, sprintId });
  }

  /**
   * Search tasks
   */
  searchTasks(searchTerm: string, filters?: Omit<TaskFilters, 'search'>): Observable<TaskResponse> {
    return this.getAllTasks({ ...filters, search: searchTerm });
  }

  /**
   * Get current tasks from state
   */
  getCurrentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  /**
   * Clear tasks state
   */
  clearTasks(): void {
    this.tasksSubject.next([]);
    this.tasksSignal.set([]);
    this.errorSignal.set(null);
  }

  /**
   * Refresh tasks (reload current filter)
   */
  refreshTasks(filters?: TaskFilters): Observable<TaskResponse> {
    return this.getAllTasks(filters);
  }

  // Utility methods for task management

  /**
   * Check if task is overdue
   */
  isTaskOverdue(task: Task): boolean {
    if (task.status === 'done' || !task.dueDate) return false;
    return new Date() > new Date(task.dueDate);
  }

  /**
   * Get task priority color
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
   * Get task status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'todo': return 'text-gray-600';
      case 'in-progress': return 'text-blue-600';
      case 'review': return 'text-purple-600';
      case 'done': return 'text-green-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Calculate task completion percentage for a project
   */
  calculateProjectCompletion(projectTasks: Task[]): number {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }
}