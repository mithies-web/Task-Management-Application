// timeline.ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../../model/user.model';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lead-timeline',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.css']
})
export class Timeline implements OnInit {
  projects: any[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedProject: string = 'all';
  selectedView: string = 'week';
  selectedTeamMember: string = 'all';
  selectedStatus: string = 'all';
  editTaskModalOpen = false;
  viewTaskModalOpen = false;
  currentTask: Task | null = null;
  teamMembers: any[] = [];
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.projects = this.projectService.getProjects();
    this.teamMembers = [
      { id: 'sarah', name: 'Sarah Johnson' },
      { id: 'mike', name: 'Mike Smith' },
      { id: 'alex', name: 'Alex Chen' }
    ];
    this.loadTasks();
  }

  loadTasks(): void {
    // In a real app, you'd filter based on selected filters
    this.tasks = [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create initial design concepts for the homepage',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2023-05-15'),
        assignee: 'Sarah Johnson',
        projectId: '1',
        tags: ['design'],
        estimatedHours: 8,
        actualHours: 6,
        progress: 75
      },
      {
        id: '2',
        title: 'Implement user authentication',
        description: 'Set up login and registration functionality',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2023-05-18'),
        assignee: 'Mike Smith',
        projectId: '1',
        tags: ['development'],
        estimatedHours: 12,
        actualHours: 0,
        progress: 0
      },
      {
        id: '3',
        title: 'Write API documentation',
        description: 'Document all endpoints for backend services',
        status: 'review',
        priority: 'medium',
        dueDate: new Date('2023-05-10'),
        assignee: 'Alex Chen',
        projectId: '1',
        tags: ['documentation'],
        estimatedHours: 5,
        actualHours: 4,
        progress: 80
      },
      {
        id: '4',
        title: 'Database schema design',
        description: 'Design the database schema for the new feature',
        status: 'done',
        priority: 'medium',
        dueDate: new Date('2023-05-05'),
        assignee: 'Mike Smith',
        projectId: '2',
        tags: ['database'],
        estimatedHours: 6,
        actualHours: 7,
        progress: 100
      },
      {
        id: '5',
        title: 'Mobile app UI implementation',
        description: 'Implement the UI for the mobile application',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2023-05-20'),
        assignee: 'Sarah Johnson',
        projectId: '2',
        tags: ['mobile', 'ui'],
        estimatedHours: 15,
        actualHours: 8,
        progress: 50
      }
    ];
    this.filterTasks();
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const projectMatch = this.selectedProject === 'all' || task.projectId === this.selectedProject;
      const memberMatch = this.selectedTeamMember === 'all' || task.assignee === this.selectedTeamMember;
      const statusMatch = this.selectedStatus === 'all' || task.status === this.selectedStatus;
      return projectMatch && memberMatch && statusMatch;
    });
  }

  onFilterChange(): void {
    this.filterTasks();
  }

  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task };
    this.editTaskModalOpen = true;
  }

  openViewTaskModal(task: Task): void {
    this.currentTask = task;
    this.viewTaskModalOpen = true;
  }

  saveTask(): void {
    if (!this.currentTask) return;
    
    // In a real app, you'd update the task in the backend
    const index = this.tasks.findIndex(t => t.id === this.currentTask?.id);
    if (index !== -1) {
      this.tasks[index] = { ...this.currentTask };
    }
    
    this.editTaskModalOpen = false;
    this.currentTask = null;
    this.filterTasks();
  }

  deleteTask(): void {
    if (!this.currentTask) return;
    
    // In a real app, you'd delete the task from the backend
    this.tasks = this.tasks.filter(t => t.id !== this.currentTask?.id);
    
    this.editTaskModalOpen = false;
    this.currentTask = null;
    this.filterTasks();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  onDueDateChange(newDate: string) {
    if (this.currentTask) {
      this.currentTask.dueDate = new Date(newDate);
    }
  }
}