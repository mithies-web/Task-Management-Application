// backlogs.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Task, Project } from '../../../model/user.model';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { LocalStorageService } from '../../../core/services/local-storage/local-storage';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  goal: string;
  projectId: string;
}

@Component({
  selector: 'app-backlogs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './backlogs.html',
  styleUrls: ['./backlogs.css']
})
export class Backlogs implements OnInit {
  projects: Project[] = [];
  teamMembers: any[] = [];
  
  allSprints: Sprint[] = [];
  filteredSprints: Sprint[] = [];
  selectedSprintId: string = '';

  allTasks: Task[] = [];
  currentSprintTasks: Task[] = [];
  productBacklogTasks: Task[] = [];
  
  selectedProjectId: string = 'all';

  // Modals
  addTaskModalOpen = false;
  editTaskModalOpen = false;
  viewTaskModalOpen = false;
  manageSprintsModalOpen = false;
  
  // State
  currentTask: Task | null = null;
  newTask: Partial<Task> = {};
  newSprint: Partial<Sprint> = {};
  editingSprint: Sprint | null = null;
  
  showToast = false;
  toastMessage = '';
  isSubmitting = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser && currentUser.team) {
      this.projects = this.projectService.getProjectsByTeam(currentUser.team);
      this.teamMembers = this.userService.getTeamMembers(currentUser.team);
      if (this.projects.length > 0) {
        this.selectedProjectId = this.projects[0].id; // Default to first project
      }
    }
    
    // In a real app, sprints would be loaded via a service. We simulate with localStorage.
    if (!this.localStorage.getSprints()) this.addSampleSprintsForDemo();
    this.allSprints = this.localStorage.getSprints<Sprint[]>() || [];

    this.loadDataForProject();
  }
  
  loadDataForProject(): void {
    this.taskService.getTasks().subscribe(tasks => {
        this.allTasks = tasks;
        this.filterSprintsAndTasks();
    });
  }
  
  filterSprintsAndTasks(): void {
    // Filter Sprints based on the selected project
    this.filteredSprints = this.allSprints.filter(s => this.selectedProjectId === 'all' || s.projectId === this.selectedProjectId);
    
    // Find the active sprint for the current project or default to the first one
    const activeSprint = this.filteredSprints.find(s => s.status === 'active');
    if (activeSprint) {
      this.selectedSprintId = activeSprint.id;
    } else if (this.filteredSprints.length > 0) {
      this.selectedSprintId = this.filteredSprints[0].id;
    } else {
      this.selectedSprintId = '';
    }

    // Filter Tasks based on the selected project and sprint
    const projectTasks = this.allTasks.filter(t => this.selectedProjectId === 'all' || t.projectId === this.selectedProjectId);
    
    this.currentSprintTasks = projectTasks.filter(t => t.sprintId === this.selectedSprintId);
    this.productBacklogTasks = projectTasks.filter(t => !t.sprintId);
  }

  onProjectChange(): void {
    this.filterSprintsAndTasks();
  }

  onSprintChange(): void {
    this.filterSprintsAndTasks();
  }

  // Task Actions
  promoteToSprint(task: Task): void {
    if (!this.selectedSprintId) {
      this.showToastMessage('No active sprint selected to promote to.');
      return;
    }
    task.sprintId = this.selectedSprintId;
    this.taskService.updateTask(task);
    this.filterSprintsAndTasks();
    this.showToastMessage('Task promoted to current sprint.');
  }

  removeFromSprint(task: Task): void {
    task.sprintId = undefined; // Move to product backlog
    this.taskService.updateTask(task);
    this.filterSprintsAndTasks();
    this.showToastMessage('Task moved back to Product Backlog.');
  }

  // Sprint Actions
  createSprint(form: NgForm): void {
    if (!form.valid) return;
    this.isSubmitting = true;
    
    const sprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: this.newSprint.name!,
      startDate: this.newSprint.startDate!,
      endDate: this.newSprint.endDate!,
      goal: this.newSprint.goal!,
      projectId: this.newSprint.projectId!,
      status: 'planned'
    };
    
    this.allSprints.push(sprint);
    this.localStorage.saveSprints(this.allSprints);
    
    this.showToastMessage('Sprint created successfully.');
    this.filterSprintsAndTasks();
    this.closeModals();
    this.isSubmitting = false;
  }
  
  updateSprint(form: NgForm): void {
    if (!form.valid || !this.editingSprint) return;
    this.isSubmitting = true;

    const index = this.allSprints.findIndex(s => s.id === this.editingSprint!.id);
    if (index > -1) {
      this.allSprints[index] = this.editingSprint;
      this.localStorage.saveSprints(this.allSprints);
      this.showToastMessage('Sprint updated successfully.');
    }
    
    this.filterSprintsAndTasks();
    this.closeModals();
    this.isSubmitting = false;
  }
  
  deleteSprint(sprintId: string): void {
    if (confirm('Are you sure? This will move all tasks in this sprint to the product backlog.')) {
        this.allTasks.forEach(task => {
            if (task.sprintId === sprintId) {
                task.sprintId = undefined;
                this.taskService.updateTask(task);
            }
        });
        this.allSprints = this.allSprints.filter(s => s.id !== sprintId);
        this.localStorage.saveSprints(this.allSprints);
        this.showToastMessage('Sprint deleted.');
        this.filterSprintsAndTasks();
    }
  }

  // Modal Management
  openAddTaskModal(): void {
    this.newTask = { priority: 'medium', storyPoints: 3, status: 'todo', projectId: this.selectedProjectId === 'all' ? '' : this.selectedProjectId };
    this.addTaskModalOpen = true;
  }
  
  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task };
    this.editTaskModalOpen = true;
  }

  openViewTaskModal(task: Task): void {
    this.currentTask = task;
    this.viewTaskModalOpen = true;
  }

  openManageSprintsModal(): void {
    this.newSprint = { projectId: this.selectedProjectId === 'all' ? '' : this.selectedProjectId };
    this.editingSprint = null;
    this.manageSprintsModalOpen = true;
  }
  
  openEditSprintModal(sprint: Sprint): void {
    this.editingSprint = { ...sprint };
  }

  closeModals(): void {
    this.addTaskModalOpen = false;
    this.editTaskModalOpen = false;
    this.viewTaskModalOpen = false;
    this.manageSprintsModalOpen = false;
    this.currentTask = null;
    this.editingSprint = null;
  }
  
  // Utility & Helper methods
  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  getProjectName = (id: string) => this.projects.find(p => p.id === id)?.name || 'N/A';
  getPriorityColor = (p: string) => ({ high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }[p] || '');
  getStatusColor = (s: string) => ({ todo: 'bg-gray-100', 'in-progress': 'bg-blue-100', review: 'bg-purple-100', done: 'bg-green-100' }[s] || '');
  getSprintStatusColor = (s: string) => ({ active: 'bg-green-100 text-green-800', completed: 'bg-blue-100 text-blue-800', planned: 'bg-yellow-100 text-yellow-800'}[s] || '');

  addSampleSprintsForDemo(): void {
    const sampleSprints: Sprint[] = [
        { id: 'sprint-1', name: 'July Sprint A', startDate: '2025-07-14', endDate: '2025-07-27', status: 'active', goal: 'Launch homepage and auth features.', projectId: 'proj-1' },
        { id: 'sprint-2', name: 'August Sprint A', startDate: '2025-07-28', endDate: '2025-08-10', status: 'planned', goal: 'Develop product pages.', projectId: 'proj-1' },
        { id: 'sprint-3', name: 'App Core Sprint', startDate: '2025-07-21', endDate: '2025-08-04', status: 'active', goal: 'Core feature implementation for mobile.', projectId: 'proj-2' },
    ];
    this.localStorage.saveSprints(sampleSprints);
  }
}