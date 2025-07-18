// tasks.ts
import { Component, OnInit } from '@angular/core';
import { Task, Project, User } from '../../../model/user.model';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-lead-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class Tasks implements OnInit {
  projects: Project[] = [];
  teamMembers: User[] = [];
  allTasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  // Filters
  filters = {
    project: 'all',
    assignee: 'all',
    status: 'all',
    query: ''
  };

  // Modals & State
  editTaskModalOpen = false;
  currentTask: Task | null = null;
  isSubmitting = false;
  showToast = false;
  toastMessage = '';

  statusOptions = ['all', 'todo', 'in-progress', 'review', 'done'];
  priorityOptions = ['high', 'medium', 'low'];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser?.team) {
      this.projects = this.projectService.getProjectsByTeam(currentUser.team);
      this.teamMembers = this.userService.getTeamMembers(currentUser.team);
      const projectIds = this.projects.map(p => p.id);
      
      this.taskService.getTasks().subscribe(tasks => {
        this.allTasks = tasks.filter(task => projectIds.includes(task.projectId));
        this.applyFilters();
      });
    }
  }

  applyFilters(): void {
    this.filteredTasks = this.allTasks.filter(task => 
      (this.filters.project === 'all' || task.projectId === this.filters.project) &&
      (this.filters.assignee === 'all' || task.assignee === this.filters.assignee) &&
      (this.filters.status === 'all' || task.status === this.filters.status) &&
      (!this.filters.query || task.title.toLowerCase().includes(this.filters.query.toLowerCase()))
    );
  }

  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task, dueDate: new Date(task.dueDate) };
    this.editTaskModalOpen = true;
  }

  saveTask(form: NgForm): void {
    if (!form.valid || !this.currentTask) return;
    this.isSubmitting = true;
    this.currentTask.dueDate = new Date(form.value.dueDate);
    this.taskService.updateTask(this.currentTask);
    this.displayToast('Task updated!');
    this.editTaskModalOpen = false;
    this.isSubmitting = false;
    this.loadInitialData();
  }

  deleteTask(): void {
    if (this.currentTask && confirm(`Delete "${this.currentTask.title}"?`)) {
      this.taskService.deleteTask(this.currentTask.id);
      this.displayToast('Task deleted.');
      this.editTaskModalOpen = false;
      this.loadInitialData();
    }
  }
  
  displayToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
  
  getProjectName = (id: string) => this.projects.find(p => p.id === id)?.name || 'N/A';
  getPriorityClass = (p: string) => ({ high: 'text-red-600', medium: 'text-yellow-600', low: 'text-green-600' }[p] || 'text-gray-600');
  getStatusClass = (s: string) => ({ todo: 'bg-gray-200 text-gray-800', 'in-progress': 'bg-blue-200 text-blue-800', review: 'bg-purple-200 text-purple-800', done: 'bg-green-200 text-green-800' }[s] || '');
}
