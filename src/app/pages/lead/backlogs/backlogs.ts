// backlogs.ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../../model/user.model';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lead-backlogs',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './backlogs.html',
  styleUrls: ['./backlogs.css']
})
export class Backlogs implements OnInit {
  currentSprintTasks: Task[] = [];
  productBacklogTasks: Task[] = [];
  selectedProject: string = 'all';
  projects: any[] = [];
  addTaskModalOpen = false;
  editTaskModalOpen = false;
  manageSprintModalOpen = false;
  currentTask: Task | null = null;
  newTask: Task = {
    id: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(),
    assignee: '',
    projectId: '',
    tags: [],
    estimatedHours: 0,
    storyPoints: 3
  };
  teamMembers: any[] = [];
  sprints: any[] = [
    { id: 'sprint1', name: 'Sprint 1', startDate: '2023-05-01', endDate: '2023-05-14', status: 'completed' },
    { id: 'sprint2', name: 'Sprint 2', startDate: '2023-05-15', endDate: '2023-05-28', status: 'active' },
    { id: 'sprint3', name: 'Sprint 3', startDate: '2023-05-29', endDate: '2023-06-11', status: 'planned' }
  ];
  selectedSprint = 'sprint2';
  newSprint = {
    name: '',
    startDate: '',
    endDate: '',
    goal: ''
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.projects = this.projectService.getProjects();
    this.teamMembers = [
      { id: '1', name: 'Sarah Johnson', role: 'Designer' },
      { id: '2', name: 'Mike Smith', role: 'Developer' },
      { id: '3', name: 'Alex Chen', role: 'Developer' }
    ];
    this.loadTasks();
  }

  loadTasks(): void {
    this.currentSprintTasks = [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create initial design concepts for the homepage',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2023-05-18'),
        assignee: 'Sarah Johnson',
        projectId: '1',
        tags: ['design'],
        estimatedHours: 8,
        storyPoints: 5
      },
      {
        id: '2',
        title: 'Implement user authentication',
        description: 'Set up login and registration functionality',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2023-05-20'),
        assignee: 'Mike Smith',
        projectId: '1',
        tags: ['development'],
        estimatedHours: 12,
        storyPoints: 8
      },
      {
        id: '3',
        title: 'Write API documentation',
        description: 'Document all endpoints for backend services',
        status: 'review',
        priority: 'medium',
        dueDate: new Date('2023-05-15'),
        assignee: 'Alex Chen',
        projectId: '1',
        tags: ['documentation'],
        estimatedHours: 5,
        storyPoints: 3
      }
    ];

    this.productBacklogTasks = [
      {
        id: '10',
        title: 'Implement payment gateway',
        description: 'Integrate Stripe payment system',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2023-06-01'),
        assignee: '',
        projectId: '1',
        tags: ['development'],
        estimatedHours: 16,
        storyPoints: 13
      },
      {
        id: '11',
        title: 'Create admin dashboard',
        description: 'Build interface for admin users',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2023-06-05'),
        assignee: '',
        projectId: '1',
        tags: ['development'],
        estimatedHours: 10,
        storyPoints: 8
      },
      {
        id: '12',
        title: 'Optimize image loading',
        description: 'Implement lazy loading for images',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2023-06-10'),
        assignee: '',
        projectId: '1',
        tags: ['performance'],
        estimatedHours: 6,
        storyPoints: 5
      }
    ];
  }

  openAddTaskModal(): void {
    this.newTask = {
      id: '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(),
      assignee: '',
      projectId: this.selectedProject !== 'all' ? this.selectedProject : '',
      tags: [],
      estimatedHours: 0,
      storyPoints: 3
    };
    this.addTaskModalOpen = true;
  }

  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task };
    this.editTaskModalOpen = true;
  }

  openManageSprintModal(): void {
    this.manageSprintModalOpen = true;
  }

  saveTask(): void {
    if (this.editTaskModalOpen && this.currentTask) {
      // Update existing task
      const index = this.currentSprintTasks.findIndex(t => t.id === this.currentTask?.id);
      if (index !== -1) {
        this.currentSprintTasks[index] = { ...this.currentTask };
      }
    } else if (this.addTaskModalOpen) {
      // Add new task
      this.newTask.id = 'task' + (this.productBacklogTasks.length + 1);
      this.productBacklogTasks.push({ ...this.newTask });
    }
    
    this.closeModals();
  }

  deleteTask(): void {
    if (this.currentTask) {
      this.currentSprintTasks = this.currentSprintTasks.filter(t => t.id !== this.currentTask?.id);
      this.closeModals();
    }
  }

  promoteToSprint(task: Task): void {
    task.status = 'todo';
    this.currentSprintTasks.push({ ...task });
    this.productBacklogTasks = this.productBacklogTasks.filter(t => t.id !== task.id);
  }

  removeFromSprint(task: Task): void {
    task.status = 'todo';
    task.assignee = '';
    this.productBacklogTasks.push({ ...task });
    this.currentSprintTasks = this.currentSprintTasks.filter(t => t.id !== task.id);
  }

  createSprint(): void {
    const newSprint = {
      id: 'sprint' + (this.sprints.length + 1),
      name: this.newSprint.name,
      startDate: this.newSprint.startDate,
      endDate: this.newSprint.endDate,
      status: 'planned',
      goal: this.newSprint.goal
    };
    this.sprints.push(newSprint);
    this.newSprint = { name: '', startDate: '', endDate: '', goal: '' };
    this.manageSprintModalOpen = false;
  }

  closeModals(): void {
    this.addTaskModalOpen = false;
    this.editTaskModalOpen = false;
    this.manageSprintModalOpen = false;
    this.currentTask = null;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSprintStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSprintStoryPoints(): number {
    if (!this.currentSprintTasks || !Array.isArray(this.currentSprintTasks)) {
      return 0;
    }
    return this.currentSprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  }

  onTagsInputChange(event: any) {
    const value = event.target.value;
    this.newTask.tags = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
  }
}