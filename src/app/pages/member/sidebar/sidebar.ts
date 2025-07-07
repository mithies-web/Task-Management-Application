import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../model/user.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  @Input() currentUser: User | null = null;
  @Input() activePage: string = 'dashboard';
  @Input() isMobileSidebarOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  getActiveClass(page: string): string {
    return this.activePage === page ? 'bg-indigo-700' : '';
  }
}