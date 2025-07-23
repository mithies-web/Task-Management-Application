import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { UserService } from '../../../core/services/user/user';
import { TeamService } from '../../../core/services/team/team';
import { ProjectService } from '../../../core/services/project/project';
import { TaskService } from '../../../core/services/task/task';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-tasks text-indigo-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h1 class="text-2xl font-bold text-gray-900">GenFlow Admin Dashboard</h1>
                <p class="text-sm text-gray-500">Welcome back, {{ currentUser()?.name }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <i class="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Stats Overview -->
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Users Stats -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-users text-indigo-600 text-2xl"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats().totalUsers }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <a routerLink="/admin/users" class="font-medium text-indigo-700 hover:text-indigo-900">
                    View all users
                  </a>
                </div>
              </div>
            </div>

            <!-- Teams Stats -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-user-friends text-green-600 text-2xl"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Teams</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats().totalTeams }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <a routerLink="/admin/teams" class="font-medium text-green-700 hover:text-green-900">
                    View all teams
                  </a>
                </div>
              </div>
            </div>

            <!-- Projects Stats -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-project-diagram text-blue-600 text-2xl"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats().activeProjects }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <a routerLink="/admin/projects" class="font-medium text-blue-700 hover:text-blue-900">
                    View all projects
                  </a>
                </div>
              </div>
            </div>

            <!-- Tasks Stats -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i class="fas fa-tasks text-orange-600 text-2xl"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats().totalTasks }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-5 py-3">
                <div class="text-sm">
                  <a routerLink="/admin/tasks" class="font-medium text-orange-700 hover:text-orange-900">
                    View all tasks
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  routerLink="/admin/users"
                  class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div>
                    <span class="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                      <i class="fas fa-user-plus text-xl"></i>
                    </span>
                  </div>
                  <div class="mt-4">
                    <h3 class="text-lg font-medium text-gray-900">Manage Users</h3>
                    <p class="mt-2 text-sm text-gray-500">
                      Create, edit, and manage user accounts
                    </p>
                  </div>
                </a>

                <a
                  routerLink="/admin/teams"
                  class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                >
                  <div>
                    <span class="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <i class="fas fa-users-cog text-xl"></i>
                    </span>
                  </div>
                  <div class="mt-4">
                    <h3 class="text-lg font-medium text-gray-900">Manage Teams</h3>
                    <p class="mt-2 text-sm text-gray-500">
                      Create and organize teams and departments
                    </p>
                  </div>
                </a>

                <a
                  routerLink="/admin/projects"
                  class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div>
                    <span class="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <i class="fas fa-folder-plus text-xl"></i>
                    </span>
                  </div>
                  <div class="mt-4">
                    <h3 class="text-lg font-medium text-gray-900">Manage Projects</h3>
                    <p class="mt-2 text-sm text-gray-500">
                      Oversee all projects and their progress
                    </p>
                  </div>
                </a>

                <a
                  routerLink="/admin/tasks"
                  class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div>
                    <span class="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                      <i class="fas fa-clipboard-list text-xl"></i>
                    </span>
                  </div>
                  <div class="mt-4">
                    <h3 class="text-lg font-medium text-gray-900">Manage Tasks</h3>
                    <p class="mt-2 text-sm text-gray-500">
                      Monitor and manage all tasks across projects
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div class="flow-root">
                <ul class="-mb-8">
                  <li *ngFor="let activity of recentActivity(); let last = last">
                    <div class="relative pb-8" [class.pb-0]="last">
                      <span *ngIf="!last" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                                [ngClass]="getActivityIconClass(activity.type)">
                            <i [class]="getActivityIcon(activity.type)"></i>
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">{{ activity.description }}</p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            {{ activity.time }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  currentUser = this.authService.currentUser;
  stats = signal({
    totalUsers: 0,
    totalTeams: 0,
    activeProjects: 0,
    totalTasks: 0
  });

  recentActivity = signal([
    { type: 'user', description: 'New user registered', time: '2 hours ago' },
    { type: 'project', description: 'Project "Website Redesign" created', time: '4 hours ago' },
    { type: 'team', description: 'Frontend team updated', time: '6 hours ago' },
    { type: 'task', description: '5 tasks completed today', time: '8 hours ago' }
  ]);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private teamService: TeamService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    // Load users count
    this.userService.getAllUsers({ limit: 1 }).subscribe({
      next: (response) => {
        this.stats.update(stats => ({
          ...stats,
          totalUsers: response.pagination?.total || 0
        }));
      }
    });

    // Load teams count
    this.teamService.getAllTeams({ limit: 1 }).subscribe({
      next: (response) => {
        this.stats.update(stats => ({
          ...stats,
          totalTeams: response.pagination?.total || 0
        }));
      }
    });

    // Load projects count
    this.projectService.getAllProjects({ status: 'in-progress', limit: 1 }).subscribe({
      next: (response) => {
        this.stats.update(stats => ({
          ...stats,
          activeProjects: response.pagination?.total || 0
        }));
      }
    });

    // Load tasks count
    this.taskService.getAllTasks({ limit: 1 }).subscribe({
      next: (response) => {
        this.stats.update(stats => ({
          ...stats,
          totalTasks: response.pagination?.total || 0
        }));
      }
    });
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'user': return 'bg-indigo-500';
      case 'team': return 'bg-green-500';
      case 'project': return 'bg-blue-500';
      case 'task': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user': return 'fas fa-user text-white text-xs';
      case 'team': return 'fas fa-users text-white text-xs';
      case 'project': return 'fas fa-project-diagram text-white text-xs';
      case 'task': return 'fas fa-tasks text-white text-xs';
      default: return 'fas fa-circle text-white text-xs';
    }
  }

  logout() {
    this.authService.logout();
  }
}