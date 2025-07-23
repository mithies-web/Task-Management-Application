import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, CreateUserRequest, UpdateUserRequest } from '../../../core/services/user/user';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
              <p class="text-sm text-gray-500">Manage system users and their permissions</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="showCreateModal = true"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-plus mr-2"></i>
                Add User
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
                  placeholder="Search users..."
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  [(ngModel)]="filters.role"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="team-lead">Team Lead</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  [(ngModel)]="filters.status"
                  (change)="applyFilters()"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="on-leave">On Leave</option>
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

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div *ngIf="userService.loadingSignal()" class="text-center py-4">
              <i class="fas fa-spinner fa-spin text-gray-400 text-2xl"></i>
              <p class="text-gray-500 mt-2">Loading users...</p>
            </div>

            <div *ngIf="userService.errorSignal()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {{ userService.errorSignal() }}
            </div>

            <div *ngIf="!userService.loadingSignal() && users().length === 0" class="text-center py-8">
              <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
              <p class="text-gray-500">No users found</p>
            </div>

            <div *ngIf="!userService.loadingSignal() && users().length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let user of users()">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-full" [src]="userService.getUserAvatar(user)" [alt]="user.name">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [ngClass]="userService.getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [ngClass]="userService.getStatusBadgeClass(user.status)">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ user.department || 'Not assigned' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.lastActive) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        (click)="editUser(user)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteUser(user)"
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

      <!-- Create/Edit User Modal -->
      <div *ngIf="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ showCreateModal ? 'Create New User' : 'Edit User' }}
            </h3>
            
            <form [formGroup]="userForm" (ngSubmit)="saveUser()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    formControlName="name"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    formControlName="username"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div *ngIf="showCreateModal">
                  <label class="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    formControlName="password"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    formControlName="role"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="user">User</option>
                    <option value="team-lead">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div *ngIf="showEditModal">
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    formControlName="status"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    formControlName="department"
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
                  [disabled]="userForm.invalid || isSubmitting()"
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
export class UserManagementComponent implements OnInit {
  users = this.userService.usersSignal;
  showCreateModal = false;
  showEditModal = false;
  isSubmitting = signal(false);
  selectedUser: User | null = null;
  userForm: FormGroup;
  pagination: any = null;

  filters = {
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 10
  };

  constructor(
    public userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['user', Validators.required],
      status: ['active'],
      department: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const cleanFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '')
    );

    this.userService.getAllUsers(cleanFilters).subscribe({
      next: (response) => {
        this.pagination = response.pagination;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
      }
    });
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadUsers();
  }

  clearFilters() {
    this.filters = {
      search: '',
      role: '',
      status: '',
      page: 1,
      limit: 10
    };
    this.loadUsers();
  }

  previousPage() {
    if (this.filters.page > 1) {
      this.filters.page--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.pagination && this.filters.page < this.pagination.pages) {
      this.filters.page++;
      this.loadUsers();
    }
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.userForm.patchValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department || ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showEditModal = true;
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert('Failed to delete user: ' + error.message);
        }
      });
    }
  }

  saveUser() {
    if (this.userForm.valid) {
      this.isSubmitting.set(true);

      if (this.showCreateModal) {
        const userData: CreateUserRequest = this.userForm.value;
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadUsers();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to create user: ' + error.message);
          }
        });
      } else if (this.showEditModal && this.selectedUser) {
        const userData: UpdateUserRequest = this.userForm.value;
        delete userData.password; // Don't update password in edit mode
        
        this.userService.updateUser(this.selectedUser._id, userData).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.closeModal();
            this.loadUsers();
          },
          error: (error) => {
            this.isSubmitting.set(false);
            alert('Failed to update user: ' + error.message);
          }
        });
      }
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedUser = null;
    this.userForm.reset({
      role: 'user',
      status: 'active'
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}