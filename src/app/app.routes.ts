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
import { HelpCenter } from './pages/admin/help-center/help-center';
import { LeadLayout } from './pages/lead/lead-layout/lead-layout';
import { Dashboard } from './pages/lead/dashboard/dashboard';
import { Timeline } from './pages/lead/timeline/timeline';
import { Backlogs } from './pages/lead/backlogs/backlogs';
import { Boards } from './pages/lead/boards/boards';
import { MemberLayout } from './pages/member/member-layout/member-layout';
import { Dashboard as MemberDashboard } from './pages/member/dashboard/dashboard';
import { Timeline as MemberTimeline } from './pages/member/timeline/timeline';
import { Backlogs as MemberBacklogs } from './pages/member/backlogs/backlogs';
import { Boards as MemberBoards } from './pages/member/boards/boards';


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
        path: 'help-center',
        component: HelpCenter,
        data: { title: 'Help Center' }
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
    component: LeadLayout,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: UserRole.LEAD },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        data: { title: 'Dashboard' }
      },
      {
        path: 'timeline',
        component: Timeline,
        data: { title: 'Timeline' }
      },
      {
        path: 'backlogs',
        component: Backlogs,
        data: { title: 'Backlogs' }
      },
      {
        path: 'boards',
        component: Boards,
        data: { title: 'Boards' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'member',
    component: MemberLayout,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: [UserRole.USER] },
    children: [
      {
        path: 'dashboard',
        component: MemberDashboard,
        data: { title: 'Dashboard' }
      },
      {
        path: 'timeline',
        component: MemberTimeline,
        data: { title: 'Timeline' }
      },
      {
        path: 'backlogs',
        component: MemberBacklogs,
        data: { title: 'Backlogs' }
      },
      {
        path: 'boards',
        component: MemberBoards,
        data: { title: 'Boards' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];