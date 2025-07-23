import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-management.component').then(c => c.UserManagementComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/team-management.component').then(c => c.TeamManagementComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./projects/project-management.component').then(c => c.ProjectManagementComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/task-management.component').then(c => c.TaskManagementComponent)
  }
];