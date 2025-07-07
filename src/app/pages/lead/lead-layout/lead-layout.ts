// lead-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user/user';
import { User } from '../../../model/user.model';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-lead-layout',
  imports: [
    CommonModule,
    Sidebar,
    RouterOutlet,
  ],
  templateUrl: './lead-layout.html',
  styleUrls: ['./lead-layout.css']
})
export class LeadLayout implements OnInit {
  currentUser: User | null = null;
  isSidebarCollapsed = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // In a real app, you'd get this from auth service
    this.currentUser = this.userService.getUsers().find(u => u.role === 'team-lead') ?? null;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}