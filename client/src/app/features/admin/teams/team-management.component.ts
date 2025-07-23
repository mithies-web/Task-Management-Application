import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamService, CreateTeamRequest, UpdateTeamRequest, Team } from '../../../core/services/team/team';
import { UserService } from '../../../core/services/user/user';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Team Management</h1>
              <p class="text-sm text-gray-500">Manage teams and their members</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="showCreateModal = true; loadUsers()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-plus mr-2"></i>
                Add Team
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
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  [(ngModel)]="filters.search"
                  (input)="applyFilters()"
                  placeholder="Search teams..."
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <select
                  [(ngModel)]="filters.department"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
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

        <!-- Teams Grid -->
        <div *ngIf="teamService.loadingSignal()" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
          <p class="text-gray-500 mt-2">Loading teams...</p>
        </div>

        <div *ngIf="teamService.errorSignal()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {{ teamService.errorSignal() }}
        </div>

        <div *ngIf="!teamService.loadingSignal() && teams().length === 0" class="text-center py-8">
          <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
          <p class="text-gray-500">No teams found</p>
        </div>

        <div *ngIf="!teamService.loadingSignal() && teams().length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let team of teams()" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ team.name }}</h3>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      [ngClass]="teamService.getDepartmentBadgeClass(team.department)">
                  {{ team.department }}
                </span>
              </div>
              
              <p class="text-sm text-gray-500 mb-4">{{ team.description || 'No description' }}</p>
              
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-user-tie mr-2"></i>
                  <span>Lead: {{ team.lead?.name || 'Not assigned' }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-users mr-2"></i>
                  <span>Members: {{ team.memberCount || 0 }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="fas fa-project-diagram mr-2"></i>
                  <span>Projects: {{ team.projectCount || 0 }}</span>
                </div>
              </div>

              <div class="mt-4 flex justify-between">
                <button
                  (click)="editTeam(team)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  <i class="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  (click)="manageMembers(team)"
                  class="text-green-600 hover:text-green-900 text-sm font-medium"
                >
                  <i class="fas fa-users-cog mr-1"></i>
                  Members
                </button>
                <button
                  (click)="deleteTeam(team)"
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

      <!-- Create/Edit Team Modal -->
      <div *ngIf="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ showCreateModal ? 'Create New Team' : 'Edit Team' }}
            </h3>
            
            <form [formGroup]="teamForm" (ngSubmit)="saveTeam()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    formControlName="name"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    formControlName="department"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Team Lead</label>
                  <select
                    formControlName="lead"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Team Lead</option>
                    <option *ngFor="let user of availableUsers()" [value]="user._id">
                      {{ user.name }} ({{ user.role }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
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
                  [disabled]="teamForm.invalid || isSubmitting()"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {{ isSubmitting() ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Manage Members Modal -->
      <div *ngIf="showMembersModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Manage Team Members - {{ selectedTeam?.name }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Available Users -->
              <div>
                <h4 class="text-md font-medium text-gray-700 mb-2">Available Users</h4>
                <div class="border rounded-md p-4 max-h-64 overflow-y-auto">
                  <div *ngFor="let user of availableUsers()" class="flex items-center justify-between py-2">
                    <div class="flex items-center">
                      <img class="h-8 w-8 rounded-full mr-3" [src]="userService.getUserAvatar(user)" [alt]="user.name">
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                        <p class="text-xs text-gray-500">{{ user.role }}</p>
                      </div>
                    </div>
                    <button
                      (click)="addMemberToTeam(user._id)"
                      class="text-green-600 hover:text-green-900 text-sm"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <div *ngIf="availableUsers().length === 0" class="text-center text-gray-500 py-4">
                    No available users
                  </div>
                </div>
              </div>

              <!-- Current Members -->
              <div>
                <h4 class="text-md font-medium text-gray-700 mb-2">Current Members</h4>
                <div class="border rounded-md p-4 max-h-64 overflow-y-auto">
                  <div *ngFor="let member of selectedTeam?.members" class="flex items-center justify-between py-2">
                    <div class="flex items-center">
                      <img class="h-8 w-8 rounded-full mr-3" [src]="userService.getUserAvatar(member)" [alt]="member.name">
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                        <p class="text-xs text-gray-500">{{ member.role }}</p>
                      </div>
                    </div>
                    <button
                      (click)="removeMemberFromTeam(member._id)"
                      class="text-red-600 hover:text-red-900 text-sm"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                  </div>
                  <div *ngIf="!selectedTeam?.members || selectedTeam.members.length === 0" class="text-center text-gray-500 py-4">
                    No members assigned
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button
                (click)="closeMembersModal()"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TeamManagementComponent implements OnInit {
  teams = this.teamService.teamsSignal;
  availableUsers = signal<User[]>([]);
  showCreateModal = false;
  showEditModal = false;
  showMembersModal = false;
  isSubmitting = signal(false);
  selectedTeam: Team | null = null;
  teamForm: FormGroup;
  pagination: any = null;

  filters = {
    search: '',
    department: '',
    page: 1,
    limit: 9
  };

  constructor(
    public teamService: TeamService,
    public userService: UserService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      department: ['', Validators.required],
      lead: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    const cleanFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '')
    );

    this.teamService.getAllTeams(cleanFilters).subscribe({
      next: (response) => {
        this.pagination = response.pagination;
      },
      error: (error) => {
        console.error('Failed to load teams:', error);
      }
    });
  }

  loadUsers() {
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
    this.loadTeams();
  }

  clearFilters() {
    this.filters = {
      search: '',
      department: '',
      page: 1,
      limit: 9
    };
    this.loadTeams();
  }

  previousPage() {
    if (this.filters.page > 1) {
      this.filters.page--;
      this.loadTeams();
    }
  }

  nextPage() {
    if (this.pagination && this.filters.page < this.pagination.pages) {
      this.filters.page++;
      this.loadTeams();
    }
  }

  editTeam(team: Team) {
    this.selectedTeam = team;
    this.teamForm.patchValue({
      name: team.name,
      department: team.department,
      lead: team.lead?._id || '',
      description: team.description || ''
    });
    this.loadUsers();
    this.showEditModal = true;
  }

  deleteTeam(team: Team) {
    if (confirm(`Are you sure you want to delete ${team.name}?`)) {
      this.teamService.deleteTeam(team._id || '').subscribe({
        next: () => {
          this.loadTeams();
        },
        error: (error) => {
          alert('Failed to delete team: ' + error.message);
        }
      });
    }
  }

  manageMembers(team: Team) {
    this.selectedTeam = team;
    this.loadUsers();
    this.showMembersModal = true;
  }

  saveTeam() {
    if (this.teamForm.valid) {
      this.isSubmitting.set(true);

      if (this.showCreateModal) {
        const teamData: CreateTeamRequest = this.teamForm.value;
        this.teamService.createTeam(teamData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadTeams();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to create team: ' + error.message);
          }
        });
      } else if (this.showEditModal && this.selectedTeam) {
        const teamData: UpdateTeamRequest = this.teamForm.value;
        
        this.teamService.updateTeam(this.selectedTeam._id || '', teamData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadTeams();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to update team: ' + error.message);
          }
        });
      }
    }
  }

  addMemberToTeam(userId: string) {
    if (this.selectedTeam) {
      this.teamService.addTeamMembers(this.selectedTeam._id || '', [userId]).subscribe({
        next: (response) => {
          this.selectedTeam = response.data;
          this.loadUsers();
          this.loadTeams();
        },
        error: (error) => {
          alert('Failed to add member: ' + error.message);
        }
      });
    }
  }

  removeMemberFromTeam(userId: string) {
    if (this.selectedTeam) {
      this.teamService.removeTeamMembers(this.selectedTeam._id || '', [userId]).subscribe({
        next: (response) => {
          this.selectedTeam = response.data;
          this.loadUsers();
          this.loadTeams();
        },
        error: (error) => {
          alert('Failed to remove member: ' + error.message);
        }
      });
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedTeam = null;
    this.teamForm.reset();
  }

  closeMembersModal() {
    this.showMembersModal = false;
    this.selectedTeam = null;
  }
}