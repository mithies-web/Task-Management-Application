import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/user-dashboard.component').then(c => c.UserDashboardComponent)
  }
];