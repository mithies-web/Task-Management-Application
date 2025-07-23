import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'project' | 'team' | 'task' | 'general';
  date: string;
  read: boolean;
  projectId?: string;
  taskId?: string;
  memberId?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: 'project' | 'team' | 'task' | 'general';
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount?: number;
  message?: string;
}

export interface SingleNotificationResponse {
  success: boolean;
  data: Notification;
  message?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'project' | 'team' | 'task' | 'general';
  userId: string;
  projectId?: string;
  taskId?: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  projectNotifications: number;
  teamNotifications: number;
  taskNotifications: number;
  generalNotifications: number;
  todayNotifications: number;
  weekNotifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // State management
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Angular signals for reactive state
  public notificationsSignal = signal<Notification[]>([]);
  public unreadCountSignal = signal<number>(0);
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
    console.error('NotificationService Error:', error);
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
   * Get all notifications with optional filters
   */
  getAllNotifications(filters?: NotificationFilters): Observable<NotificationResponse> {
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

    return this.http.get<NotificationResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
          this.notificationsSignal.set(response.data);
          
          if (response.unreadCount !== undefined) {
            this.unreadCountSubject.next(response.unreadCount);
            this.unreadCountSignal.set(response.unreadCount);
          }
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
   * Create new notification
   */
  createNotification(notificationData: CreateNotificationRequest): Observable<SingleNotificationResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<SingleNotificationResponse>(this.apiUrl, notificationData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Add new notification to current notifications
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = [response.data, ...currentNotifications];
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Update unread count
          if (!response.data.read) {
            const currentUnreadCount = this.unreadCountSubject.value;
            this.unreadCountSubject.next(currentUnreadCount + 1);
            this.unreadCountSignal.set(currentUnreadCount + 1);
          }
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
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<SingleNotificationResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<SingleNotificationResponse>(`${this.apiUrl}/${notificationId}/read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Update notification in current notifications
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => 
            notification.id === notificationId ? { ...notification, read: true } : notification
          );
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Update unread count
          const currentUnreadCount = this.unreadCountSubject.value;
          if (currentUnreadCount > 0) {
            this.unreadCountSubject.next(currentUnreadCount - 1);
            this.unreadCountSignal.set(currentUnreadCount - 1);
          }
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
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{success: boolean; message: string}>(`${this.apiUrl}/read-all`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Mark all notifications as read in current state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => 
            ({ ...notification, read: true })
          );
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Reset unread count
          this.unreadCountSubject.next(0);
          this.unreadCountSignal.set(0);
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
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/${notificationId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove notification from current notifications
          const currentNotifications = this.notificationsSubject.value;
          const notificationToDelete = currentNotifications.find(n => n.id === notificationId);
          const updatedNotifications = currentNotifications.filter(notification => 
            notification.id !== notificationId
          );
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Update unread count if deleted notification was unread
          if (notificationToDelete && !notificationToDelete.read) {
            const currentUnreadCount = this.unreadCountSubject.value;
            if (currentUnreadCount > 0) {
              this.unreadCountSubject.next(currentUnreadCount - 1);
              this.unreadCountSignal.set(currentUnreadCount - 1);
            }
          }
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
   * Delete all notifications
   */
  deleteAllNotifications(): Observable<{success: boolean; message: string}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string}>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Clear all notifications
          this.notificationsSubject.next([]);
          this.notificationsSignal.set([]);
          
          // Reset unread count
          this.unreadCountSubject.next(0);
          this.unreadCountSignal.set(0);
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
   * Get notifications by type
   */
  getNotificationsByType(type: 'project' | 'team' | 'task' | 'general', filters?: Omit<NotificationFilters, 'type'>): Observable<NotificationResponse> {
    return this.getAllNotifications({ ...filters, type });
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(filters?: Omit<NotificationFilters, 'read'>): Observable<NotificationResponse> {
    return this.getAllNotifications({ ...filters, read: false });
  }

  /**
   * Get read notifications
   */
  getReadNotifications(filters?: Omit<NotificationFilters, 'read'>): Observable<NotificationResponse> {
    return this.getAllNotifications({ ...filters, read: true });
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): Observable<NotificationStats> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<{success: boolean; data: NotificationStats}>(`${this.apiUrl}/stats`, {
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
   * Bulk mark notifications as read
   */
  bulkMarkAsRead(notificationIds: string[]): Observable<{success: boolean; message: string; updated: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<{success: boolean; message: string; updated: number}>(`${this.apiUrl}/bulk-read`, {
      notificationIds
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          // Mark specified notifications as read
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => 
            notificationIds.includes(notification.id) ? { ...notification, read: true } : notification
          );
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Update unread count
          const markedAsReadCount = notificationIds.length;
          const currentUnreadCount = this.unreadCountSubject.value;
          const newUnreadCount = Math.max(0, currentUnreadCount - markedAsReadCount);
          this.unreadCountSubject.next(newUnreadCount);
          this.unreadCountSignal.set(newUnreadCount);
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
   * Bulk delete notifications
   */
  bulkDeleteNotifications(notificationIds: string[]): Observable<{success: boolean; message: string; deleted: number}> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{success: boolean; message: string; deleted: number}>(`${this.apiUrl}/bulk-delete`, {
      headers: this.getHeaders(),
      body: { notificationIds }
    }).pipe(
      tap(response => {
        if (response.success) {
          // Remove deleted notifications from current notifications
          const currentNotifications = this.notificationsSubject.value;
          const deletedUnreadCount = currentNotifications
            .filter(n => notificationIds.includes(n.id) && !n.read)
            .length;
          
          const updatedNotifications = currentNotifications.filter(notification => 
            !notificationIds.includes(notification.id)
          );
          this.notificationsSubject.next(updatedNotifications);
          this.notificationsSignal.set(updatedNotifications);
          
          // Update unread count
          const currentUnreadCount = this.unreadCountSubject.value;
          const newUnreadCount = Math.max(0, currentUnreadCount - deletedUnreadCount);
          this.unreadCountSubject.next(newUnreadCount);
          this.unreadCountSignal.set(newUnreadCount);
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
   * Get current notifications from state
   */
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get current unread count from state
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Clear notifications state
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.notificationsSignal.set([]);
    this.unreadCountSubject.next(0);
    this.unreadCountSignal.set(0);
    this.errorSignal.set(null);
  }

  /**
   * Refresh notifications (reload current filter)
   */
  refreshNotifications(filters?: NotificationFilters): Observable<NotificationResponse> {
    return this.getAllNotifications(filters);
  }

  // Utility methods for notification management

  /**
   * Get notification type color
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'project': return 'text-blue-600';
      case 'team': return 'text-green-600';
      case 'task': return 'text-orange-600';
      case 'general': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get notification type badge class
   */
  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'team': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get notification priority based on type and content
   */
  getNotificationPriority(notification: Notification): 'high' | 'medium' | 'low' {
    if (notification.type === 'task' && notification.message.includes('overdue')) {
      return 'high';
    }
    if (notification.type === 'project' && notification.message.includes('deadline')) {
      return 'high';
    }
    if (notification.type === 'team') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Format notification time
   */
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Check if notification is recent (within last hour)
   */
  isNotificationRecent(notification: Notification): boolean {
    const date = new Date(notification.date);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 1;
  }

  /**
   * Group notifications by date
   */
  groupNotificationsByDate(notifications: Notification[]): { [key: string]: Notification[] } {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'project': return 'fas fa-project-diagram';
      case 'team': return 'fas fa-users';
      case 'task': return 'fas fa-tasks';
      case 'general': return 'fas fa-bell';
      default: return 'fas fa-bell';
    }
  }
}