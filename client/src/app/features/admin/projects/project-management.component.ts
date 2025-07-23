import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService, CreateProjectRequest, UpdateProjectRequest, Project } from '../../../core/services/project/project';
import { TeamService } from '../../../core/services/team/team';
import { UserService } from '../../../core/services/user/user';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Project Management</h1>
              <p class="text-sm text-gray-500">Manage projects and track progress</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="showCreateModal = true; loadTeamsAndUsers()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-plus mr-2"></i>
                Add Project
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
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  [(ngModel)]="filters.search"
                  (input)="applyFilters()"
                  placeholder="Search projects..."
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
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
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

        <!-- Projects Grid -->
        <div *ngIf="projectService.loadingSignal()" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
          <p class="text-gray-500 mt-2">Loading projects...</p>
        </div>

        <div *ngIf="projectService.errorSignal()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {{ projectService.errorSignal() }}
        </div>

        <div *ngIf="!projectService.loadingSignal() && projects().length === 0" class="text-center py-8">
          <i class="fas fa-project-diagram text-gray-400 text-4xl mb-4"></i>
          <p class="text-gray-500">No projects found</p>
        </div>

        <div *ngIf="!projectService.loadingSignal() && projects().length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let project of projects()" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ project.name }}</h3>
                <div class="flex space-x-2">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="projectService.getStatusBadgeClass(project.status)">
                    {{ project.status }}
                  </span>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="projectService.getPriorityBadgeClass(project.priority)">
                    {{ project.priority }}
                  </span>
                </div>
              </div>
              
              <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ project.description || 'No description' }}</p>
              
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{{ project.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                       [style.width.%]="project.progress"></div>
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-users mr-2"></i>
                  <span>Team: {{ project.team.name }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-user-tie mr-2"></i>
                  <span>Lead: {{ project.lead.name }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-calendar mr-2"></i>
                  <span>Due: {{ formatDate(project.deadline) }}</span>
                </div>
                <div class="flex items-center text-sm" 
                     [ngClass]="projectService.isProjectOverdue(project) ? 'text-red-600' : 'text-gray-600'">
                  <i class="fas fa-clock mr-2"></i>
                  <span>{{ projectService.getCompletionEstimate(project) }}</span>
                </div>
              </div>

              <div class="mt-4 flex justify-between">
                <button
                  (click)="editProject(project)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  <i class="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  (click)="viewProject(project)"
                  class="text-green-600 hover:text-green-900 text-sm font-medium"
                >
                  <i class="fas fa-eye mr-1"></i>
                  View
                </button>
                <button
                  (click)="deleteProject(project)"
                  class="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
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
      </main>

      <!-- Create/Edit Project Modal -->
      <div *ngIf="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-2/3 max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ showCreateModal ? 'Create New Project' : 'Edit Project' }}
            </h3>
            
            <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    formControlName="name"
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
                  <label class="block text-sm font-medium text-gray-700">Team</label>
                  <select
                    formControlName="team"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Team</option>
                    <option *ngFor="let team of availableTeams()" [value]="team._id">
                      {{ team.name }} ({{ team.department }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Project Lead</label>
                  <select
                    formControlName="lead"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Lead</option>
                    <option *ngFor="let user of availableUsers()" [value]="user._id">
                      {{ user.name }} ({{ user.role }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    formControlName="startDate"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    formControlName="endDate"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    formControlName="deadline"
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
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
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
                  [disabled]="projectForm.invalid || isSubmitting()"
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
export class ProjectManagementComponent implements OnInit {
  projects = this.projectService.projectsSignal;
  availableTeams = signal<any[]>([]);
  availableUsers = signal<any[]>([]);
  showCreateModal = false;
  showEditModal = false;
  isSubmitting = signal(false);
  selectedProject: Project | null = null;
  projectForm: FormGroup;
  pagination: any = null;

  filters = {
    search: '',
    status: '',
    priority: '',
    page: 1,
    limit: 9
  };

  constructor(
    public projectService: ProjectService,
    private teamService: TeamService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      team: ['', Validators.required],
      lead: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      deadline: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['not-started'],
      progress: [0]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    const cleanFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '')
    );

    this.projectService.getAllProjects(cleanFilters).subscribe({
      next: (response) => {
        this.pagination = response.pagination;
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
      }
    });
  }

  loadTeamsAndUsers() {
    // Load teams
    this.teamService.getAllTeams({ limit: 100 }).subscribe({
      next: (response) => {
        this.availableTeams.set(response.data);
      }
    });

    // Load users (team leads and admins)
    this.userService.getAllUsers({ limit: 100 }).subscribe({
      next: (response) => {
        this.availableUsers.set(response.data.filter(user => 
          ['admin', 'team-lead'].includes(user.role)
        ));
      }
    });
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadProjects();
  }

  clearFilters() {
    this.filters = {
      search: '',
      status: '',
      priority: '',
      page: 1,
      limit: 9
    };
    this.loadProjects();
  }

  previousPage() {
    if (this.filters.page > 1) {
      this.filters.page--;
      this.loadProjects();
    }
  }

  nextPage() {
    if (this.pagination && this.filters.page < this.pagination.pages) {
      this.filters.page++;
      this.loadProjects();
    }
  }

  editProject(project: Project) {
    this.selectedProject = project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description || '',
      team: project.team._id,
      lead: project.lead._id,
      startDate: this.formatDateForInput(project.startDate),
      endDate: this.formatDateForInput(project.endDate),
      deadline: this.formatDateForInput(project.deadline),
      priority: project.priority,
      status: project.status,
      progress: project.progress
    });
    this.loadTeamsAndUsers();
    this.showEditModal = true;
  }

  viewProject(project: Project) {
    // Navigate to project details or show detailed modal
    alert(`Project Details:\n\nName: ${project.name}\nStatus: ${project.status}\nProgress: ${project.progress}%\nTeam: ${project.team.name}\nLead: ${project.lead.name}`);
  }

  deleteProject(project: Project) {
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      this.projectService.deleteProject(project._id || '').subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          alert('Failed to delete project: ' + error.message);
        }
      });
    }
  }

  saveProject() {
    if (this.projectForm.valid) {
      this.isSubmitting.set(true);

      if (this.showCreateModal) {
        const projectData: CreateProjectRequest = this.projectForm.value;
        this.projectService.createProject(projectData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadProjects();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to create project: ' + error.message);
          }
        });
      } else if (this.showEditModal && this.selectedProject) {
        const projectData: UpdateProjectRequest = this.projectForm.value;
        
        this.projectService.updateProject(this.selectedProject._id || '', projectData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadProjects();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to update project: ' + error.message);
          }
        });
      }
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedProject = null;
    this.projectForm.reset({
      priority: 'medium',
      status: 'not-started',
      progress: 0
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateForInput(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }
}