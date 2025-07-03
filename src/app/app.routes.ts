import { Routes } from '@angular/router';
import { Home } from './pages/home/home/home';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { UserManagement } from './pages/admin/user-management/user-management';
import { AuthGuard } from './core/guard/auth/auth-guard';
import { RoleGuard } from './core/guard/role/role-guard';
import { UserRole } from './model/user.model';
import { SetNewPassword } from './auth/set-new-password/set-new-password';
import { OtpVerification } from './auth/otp-verification/otp-verification';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { ProjectManagement } from './pages/admin/project-management/project-management';
import { ContentManagement } from './pages/admin/content-management/content-management';
import { ReportManagement } from './pages/admin/report-management/report-management';
import { PerformanceManagement } from './pages/admin/performance-management/performance-management';
import { Settings } from './pages/admin/settings/settings';
import { Dashboard } from './pages/lead/dashboard/dashboard';


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
    component: OtpVerification
  },
  {
    path: 'set-new-password',
    component: SetNewPassword
  },
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: [UserRole.ADMIN] },
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
        component: ProjectManagement,
        data: { title: 'Project Management' }
      },
      {
        path: 'content',
        component: ContentManagement,
        data: { title: 'Content Management' }
      },
      {
        path: 'reports',
        component: ReportManagement,
        data: { title: 'Report Management' }
      },
      {
        path: 'performance',
        component: PerformanceManagement,
        data: { title: 'Performance Management' }
      },
      {
        path: 'settings',
        component: Settings,
        data: { title: 'Settings' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'lead',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: UserRole.LEAD },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        data: { title: 'Dashboard' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
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