import { Component, OnInit } from '@angular/core';
import { Task, User } from '../../../model/user.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  completedTasks$!: Observable<number>;
  inProgressTasks$!: Observable<number>;
  pendingReviewTasks$!: Observable<number>;
  overdueTasks$!: Observable<number>;
  myTasks$!: Observable<Task[]>;
  recentActivities$!: Observable<any[]>;
  currentUser!: User;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // In a real app, this would come from auth service
    this.currentUser = this.userService.getUsers().find(user => user.id === '2')!; // Mithies user
    
    // Get task counts
    this.completedTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(t => t.status === 'done').length));
      
    this.inProgressTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(t => t.status === 'in-progress').length));
      
    this.pendingReviewTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(t => t.status === 'review').length));
      
    this.overdueTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'done').length;
      }));
    
    // Get my tasks (limit to 5)
    this.myTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.slice(0, 5)));
    
    // Recent activities (mock data)
    this.recentActivities$ = of([
      {
        type: 'completed',
        message: 'You completed task "Design homepage mockup"',
        time: '2 hours ago'
      },
      {
        type: 'comment',
        message: 'John Doe commented on your task "Implement user authentication"',
        time: '5 hours ago'
      },
      {
        type: 'assigned',
        message: 'You were assigned to "Write API documentation"',
        time: 'Yesterday'
      }
    ]);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'done':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'Pending Review';
      case 'todo':
        return 'To Do';
      default:
        return status;
    }
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  }
}