// member-layout.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../../model/user.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user/user';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Sidebar
  ],
  templateUrl: './member-layout.html',
  styleUrls: ['./member-layout.css']
})
export class MemberLayout implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activePage: string = 'dashboard';
  isMobileSidebarOpen: boolean = false;
  isUserMenuOpen: boolean = false;
  private routerSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUsers().find(user => user.id === '2') ?? null;
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        if (url.includes('dashboard')) this.activePage = 'dashboard';
        else if (url.includes('timeline')) this.activePage = 'timeline';
        else if (url.includes('backlogs')) this.activePage = 'backlogs';
        else if (url.includes('boards')) this.activePage = 'boards';
      });
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}