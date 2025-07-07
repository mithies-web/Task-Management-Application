import { Component, OnInit } from '@angular/core';
import { Task, User } from '../../../model/user.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backlogs',
  imports: [
    CommonModule
  ],
  templateUrl: './backlogs.html',
  styleUrls: ['./backlogs.css']
})
export class Backlogs implements OnInit {
  currentSprintTasks$!: Observable<Task[]>;
  productBacklogTasks$!: Observable<Task[]>;
  currentUser!: User;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUsers().find(user => user.id === '2')!; // Mithies user
    
    // Get current sprint tasks (filter by assignee and status)
    this.currentSprintTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(
        map(tasks => tasks.filter(task => 
          task.status !== 'done' && 
          new Date(task.dueDate) <= new Date(new Date().setDate(new Date().getDate() + 14))
        )
      ));

    // Get product backlog tasks (filter by assignee and future due dates)
    this.productBacklogTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(
        map(tasks => tasks.filter(task => 
          new Date(task.dueDate) > new Date(new Date().setDate(new Date().getDate() + 14))
        )
      ));
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'high':
        return 'bg-purple-100 text-purple-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityText(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'todo':
        return 'gray';
      case 'in-progress':
        return 'blue';
      case 'review':
        return 'yellow';
      case 'done':
        return 'green';
      default:
        return 'gray';
    }
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}