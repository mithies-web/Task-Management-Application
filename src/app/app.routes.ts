import { Routes } from '@angular/router';
import { Home } from './pages/home/home/home';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { OtpVerificationComponent } from './auth/otp-verification/otp-verification';
import { SetNewPasswordComponent } from './auth/set-new-password/set-new-password';
import { AuthGuard } from './core/guard/auth-guard';
import { RoleGuard } from './core/guard/role-guard';
import { UserRole } from './model/user.model';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './pages/admin/project-management/project-management';
import { ContentManagementComponent } from './pages/admin/content-management/content-management';
import { ReportManagementComponent } from './pages/admin/report-management/report-management';
import { PerformanceManagementComponent } from './pages/admin/performance-management/performance-management';
import { SettingsComponent } from './pages/admin/settings/settings';
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { UserManagement } from './pages/admin/user-management/user-management';


export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    component: Signup
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'otp-verification',
    component: OtpVerificationComponent
  },
  {
    path: 'set-new-password',
    component: SetNewPasswordComponent
  },
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayout,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { expectedRoles: [UserRole.ADMIN] },
    children: [
      {
        path: 'dashboard',
        component: AdminDashboard,
        data: { title: 'Dashboard' }
      },
      {
        path: 'users',
        component: UserManagement,
        data: { title: 'User Management' }
      },
      {
        path: 'projects',
        component: ProjectManagementComponent,
        data: { title: 'Project Management' }
      },
      {
        path: 'content',
        component: ContentManagementComponent,
        data: { title: 'Content Management' }
      },
      {
        path: 'reports',
        component: ReportManagementComponent,
        data: { title: 'Report Management' }
      },
      {
        path: 'performance',
        component: PerformanceManagementComponent,
        data: { title: 'Performance Management' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  // Lead Routes (commented out but properly structured)
  // {
  //   path: 'lead',
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { expectedRole: UserRole.LEAD },
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadComponent: () => import('./pages/lead/dashboard/dashboard.component').then(m => m.DashboardComponent)
  //     },
  //     {
  //       path: '',
  //       redirectTo: 'dashboard',
  //       pathMatch: 'full'
  //     }
  //   ]
  // },
  // Teammate Routes (commented out but properly structured)
  // {
  //   path: 'teammate',
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { expectedRole: UserRole.TEAMMATE },
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadComponent: () => import('./pages/teammate/dashboard/dashboard.component').then(m => m.DashboardComponent)
  //     },
  //     {
  //       path: '',
  //       redirectTo: 'dashboard',
  //       pathMatch: 'full'
  //     }
  //   ]
  // },
  {
    path: '**',
    redirectTo: ''
  }
];