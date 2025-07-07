import { Component, OnInit } from '@angular/core';
import { Task, User } from '../../../model/user.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-boards',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule
  ],
  templateUrl: './boards.html',
  styleUrls: ['./boards.css']
})
export class Boards implements OnInit {
  todoTasks$!: Observable<Task[]>;
  inProgressTasks$!: Observable<Task[]>;
  reviewTasks$!: Observable<Task[]>;
  doneTasks$!: Observable<Task[]>;
  otherBoards = [
    {
      name: 'Mobile App Development',
      icon: 'fa-mobile-alt',
      color: 'blue',
      tasks: 12,
      members: 3,
      description: 'Tasks for the new mobile application'
    },
    {
      name: 'Backend Services',
      icon: 'fa-server',
      color: 'purple',
      tasks: 8,
      members: 2,
      description: 'API and database tasks'
    },
    {
      name: 'Marketing Campaign',
      icon: 'fa-chart-line',
      color: 'green',
      tasks: 5,
      members: 4,
      description: 'Q3 marketing initiatives'
    }
  ];
  currentUser!: User;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUsers().find(user => user.id === '2')!; // Mithies user
    
    // Get tasks by status
    this.todoTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(task => task.status === 'todo')));
      
    this.inProgressTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(task => task.status === 'in-progress')));
      
    this.reviewTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(task => task.status === 'review')));
      
    this.doneTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(map(tasks => tasks.filter(task => task.status === 'done')));
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update task status based on the new column
      const task = event.container.data[event.currentIndex];
      let newStatus: 'todo' | 'in-progress' | 'review' | 'done';
      
      if (event.container.id === 'todoList') newStatus = 'todo';
      else if (event.container.id === 'inProgressList') newStatus = 'in-progress';
      else if (event.container.id === 'reviewList') newStatus = 'review';
      else newStatus = 'done';
      
      // In a real app, you would call the task service to update the task status
      // this.taskService.updateTaskStatus(task.id, newStatus).subscribe();
    }
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  }
}