import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService, CreateTaskRequest, UpdateTaskRequest, Task } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Task Management</h1>
              <p class="text-sm text-gray-500">Manage tasks across all projects</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="showCreateModal = true; loadProjectsAndUsers()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-plus mr-2"></i>
                Add Task
              </button>
              <a
                routerLink="/admin/dashboard"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div>
                <label class="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  [(ngModel)]="filters.search"
                  (input)="applyFilters()"
                  placeholder="Search tasks..."
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  [(ngModel)]="filters.status"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  [(ngModel)]="filters.priority"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Project</label>
                <select
                  [(ngModel)]="filters.projectId"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Projects</option>
                  <option *ngFor="let project of availableProjects()" [value]="project._id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
              <div class="flex items-end">
                <button
                  (click)="clearFilters()"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div *ngIf="taskService.loadingSignal()" class="text-center py-4">
              <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
              <p class="text-gray-500 mt-2">Loading tasks...</p>
            </div>

            <div *ngIf="taskService.errorSignal()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {{ taskService.errorSignal() }}
            </div>

            <div *ngIf="!taskService.loadingSignal() && tasks().length === 0" class="text-center py-8">
              <i class="fas fa-tasks text-gray-400 text-4xl mb-4"></i>
              <p class="text-gray-500">No tasks found</p>
            </div>

            <div *ngIf="!taskService.loadingSignal() && tasks().length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let task of tasks()">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                        <div class="text-sm text-gray-500 truncate max-w-xs">{{ task.description || 'No description' }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getProjectName(task.projectId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div *ngIf="task.assignee" class="text-sm text-gray-900">{{ task.assignee }}</div>
                      <div *ngIf="!task.assignee" class="text-sm text-gray-500">Unassigned</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [ngClass]="getStatusBadgeClass(task.status)">
                        {{ task.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [ngClass]="getPriorityBadgeClass(task.priority)">
                        {{ task.priority }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                               [style.width.%]="task.progress"></div>
                        </div>
                        <span class="text-sm text-gray-600">{{ task.progress }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm"
                        [ngClass]="taskService.isTaskOverdue(task) ? 'text-red-600' : 'text-gray-900'">
                      {{ formatDate(task.dueDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        (click)="editTask(task)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteTask(task)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="pagination" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  (click)="previousPage()"
                  [disabled]="pagination.page <= 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  (click)="nextPage()"
                  [disabled]="pagination.page >= pagination.pages"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                    {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                    {{ pagination.total }} results
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      (click)="previousPage()"
                      [disabled]="pagination.page <= 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      (click)="nextPage()"
                      [disabled]="pagination.page >= pagination.pages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Create/Edit Task Modal -->
      <div *ngIf="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-2/3 max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ showCreateModal ? 'Create New Task' : 'Edit Task' }}
            </h3>
            
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Task Title</label>
                  <input
                    type="text"
                    formControlName="title"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Project</label>
                  <select
                    formControlName="projectId"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Project</option>
                    <option *ngFor="let project of availableProjects()" [value]="project._id">
                      {{ project.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Assignee</label>
                  <select
                    formControlName="assigneeId"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Assignee</option>
                    <option *ngFor="let user of availableUsers()" [value]="user._id">
                      {{ user.name }} ({{ user.role }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    formControlName="dueDate"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    formControlName="priority"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div *ngIf="showEditModal">
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    formControlName="status"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div *ngIf="showEditModal">
                  <label class="block text-sm font-medium text-gray-700">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    formControlName="progress"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    formControlName="estimatedHours"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Story Points</label>
                  <input
                    type="number"
                    min="0"
                    formControlName="storyPoints"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="taskForm.invalid || isSubmitting()"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {{ isSubmitting() ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskManagementComponent implements OnInit {
  tasks = this.taskService.tasksSignal;
  availableProjects = signal<any[]>([]);
  availableUsers = signal<any[]>([]);
  showCreateModal = false;
  showEditModal = false;
  isSubmitting = signal(false);
  selectedTask: Task | null = null;
  taskForm: FormGroup;
  pagination: any = null;

  filters = {
    search: '',
    status: '',
    priority: '',
    projectId: '',
    page: 1,
    limit: 10
  };

  constructor(
    public taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      projectId: ['', Validators.required],
      assigneeId: [''],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['todo'],
      progress: [0],
      estimatedHours: [0],
      storyPoints: [0]
    });
  }

  ngOnInit() {
    this.loadTasks();
    this.loadProjectsAndUsers();
  }

  loadTasks() {
    const cleanFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '')
    );

    this.taskService.getAllTasks(cleanFilters).subscribe({
      next: (response) => {
        this.pagination = response.pagination;
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
      }
    });
  }

  loadProjectsAndUsers() {
    // Load projects
    this.projectService.getAllProjects({ limit: 100 }).subscribe({
      next: (response) => {
        this.availableProjects.set(response.data);
      }
    });

    // Load users
    this.userService.getAllUsers({ limit: 100 }).subscribe({
      next: (response) => {
        this.availableUsers.set(response.data);
      }
    });
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadTasks();
  }

  clearFilters() {
    this.filters = {
      search: '',
      status: '',
      priority: '',
      projectId: '',
      page: 1,
      limit: 10
    };
    this.loadTasks();
  }

  previousPage() {
    if (this.filters.page > 1) {
      this.filters.page--;
      this.loadTasks();
    }
  }

  nextPage() {
    if (this.pagination && this.filters.page < this.pagination.pages) {
      this.filters.page++;
      this.loadTasks();
    }
  }

  editTask(task: Task) {
    this.selectedTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
      dueDate: this.formatDateForInput(task.dueDate),
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      estimatedHours: task.estimatedHours || 0,
      storyPoints: task.storyPoints || 0
    });
    this.showEditModal = true;
  }

  deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task._id || '').subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          alert('Failed to delete task: ' + error.message);
        }
      });
    }
  }

  saveTask() {
    if (this.taskForm.valid) {
      this.isSubmitting.set(true);

      if (this.showCreateModal) {
        const taskData: CreateTaskRequest = this.taskForm.value;
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadTasks();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to create task: ' + error.message);
          }
        });
      } else if (this.showEditModal && this.selectedTask) {
        const taskData: UpdateTaskRequest = this.taskForm.value;
        
        this.taskService.updateTask(this.selectedTask._id || '', taskData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadTasks();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to update task: ' + error.message);
          }
        });
      }
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedTask = null;
    this.taskForm.reset({
      priority: 'medium',
      status: 'todo',
      progress: 0,
      estimatedHours: 0,
      storyPoints: 0
    });
  }

  getProjectName(projectId: string): string {
    const project = this.availableProjects().find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }
}