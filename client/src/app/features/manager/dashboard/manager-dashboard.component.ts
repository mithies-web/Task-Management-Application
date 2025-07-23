import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-manager-dashboard',
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
                <h1 class="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
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
        <div class="px-4 py-6 sm:px-0">
          <div class="text-center">
            <i class="fas fa-user-tie text-gray-400 text-6xl mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Manager Dashboard</h2>
            <p class="text-gray-600 mb-8">Team Lead features coming soon!</p>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 class="text-lg font-medium text-blue-900 mb-2">Coming Soon</h3>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• Team performance analytics</li>
                <li>• Project management tools</li>
                <li>• Task assignment and tracking</li>
                <li>• Team member management</li>
                <li>• Sprint planning</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ManagerDashboardComponent implements OnInit {
  currentUser = this.authService.currentUser;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}