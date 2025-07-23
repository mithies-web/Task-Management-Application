import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.routes').then(m => m.managerRoutes)
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user.routes').then(m => m.userRoutes)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];