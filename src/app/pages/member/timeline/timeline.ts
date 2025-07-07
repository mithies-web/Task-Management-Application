import { Component, OnInit } from '@angular/core';
import { Task, User } from '../../../model/user.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline',
  imports: [
    CommonModule
  ],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.css']
})
export class Timeline implements OnInit {
  currentSprint = 'Sprint 3';
  milestones = [
    {
      date: 'May 15',
      isToday: true,
      items: [
        {
          title: 'Design Phase Completion',
          description: 'All design mockups should be finalized',
          type: 'milestone'
        },
        {
          title: 'Your Task Due',
          description: 'Design homepage mockup',
          type: 'task'
        }
      ]
    },
    {
      date: 'May 20',
      isToday: false,
      items: [
        {
          title: 'Development Phase Starts',
          description: 'Frontend implementation begins',
          type: 'milestone'
        }
      ]
    },
    {
      date: 'June 1',
      isToday: false,
      items: [
        {
          title: 'Beta Testing',
          description: 'Internal testing phase begins',
          type: 'milestone'
        }
      ]
    },
    {
      date: 'June 15',
      isToday: false,
      items: [
        {
          title: 'Project Delivery',
          description: 'Final delivery to client',
          type: 'milestone'
        }
      ]
    }
  ];
  
  upcomingTasks$!: Observable<any[]>;
  currentUser!: User;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUsers().find(user => user.id === '2')!; // Mithies user
    
    this.upcomingTasks$ = this.taskService.getTasksByAssignee(this.currentUser.name)
      .pipe(
        map(tasks => tasks.map(task => ({
          ...task,
          isOverdue: this.isOverdue(task.dueDate)
        }))
      ));
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getTaskIcon(task: any): string {
    if (task.title.toLowerCase().includes('design')) return 'fa-palette';
    if (task.title.toLowerCase().includes('implement')) return 'fa-code';
    if (task.title.toLowerCase().includes('documentation')) return 'fa-file-alt';
    return 'fa-tasks';
  }

  getTaskColor(task: any): string {
    if (task.isOverdue) return 'red';
    if (task.title.toLowerCase().includes('design')) return 'indigo';
    if (task.title.toLowerCase().includes('implement')) return 'blue';
    if (task.title.toLowerCase().includes('documentation')) return 'green';
    return 'gray';
  }
}