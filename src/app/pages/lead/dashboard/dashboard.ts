// dashboard.ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../../model/user.model';
import { Chart, registerables } from 'chart.js';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../model/user.model';

@Component({
  selector: 'app-lead-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats = {
    tasksCompleted: 0,
    inProgress: 0,
    pendingReview: 0,
    overdue: 0
  };

  teamMembers: any[] = [];
  projects: Project[] = [];
  performanceChart: any;
  
  memberDetailsModalOpen = false;
  selectedMember: any = null;

  // Board related properties
  selectedProject: string = '';
  boardColumns: { id: string; title: string; tasks: Task[] }[] = [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ];
  filteredColumns: { id: string; title: string; tasks: Task[] }[] = [];
  teamBoards: any[] = []; // Used for project cards
  
  addTaskModalOpen = false;
  editTaskModalOpen = false;
  currentTask: Task | null = null;
  newTask: Partial<Task> = {};
  searchQuery: string = '';
  selectedBoardMember: string = '';

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser && currentUser.team) {
      this.projects = this.projectService.getProjectsByTeam(currentUser.team);
      this.teamMembers = this.userService.getTeamMembers(currentUser.team);
    }
    
    this.route.queryParams.subscribe(params => {
      const projectId = params['projectId'];
      if (projectId && this.projects.some(p => p.id === projectId)) {
        this.selectedProject = projectId;
      } else if (this.projects.length > 0) {
        this.selectedProject = this.projects[0].id;
      }
      this.loadAllData();
    });
  }
  
  loadAllData(): void {
    this.loadBoardTasks();
    this.loadStats();
    this.initializeProjectCards();
    this.initPerformanceChart();
  }

  loadStats(): void {
    this.taskService.getTasks().subscribe(tasks => {
      const projectIds = this.projects.map(p => p.id);
      const relevantTasks = tasks.filter(t => projectIds.includes(t.projectId));

      this.stats = {
        tasksCompleted: relevantTasks.filter(t => t.status === 'done').length,
        inProgress: relevantTasks.filter(t => t.status === 'in-progress').length,
        pendingReview: relevantTasks.filter(t => t.status === 'review').length,
        overdue: relevantTasks.filter(t => 
          new Date(t.dueDate) < new Date() && t.status !== 'done'
        ).length
      };
    });
  }
  
  loadBoardTasks(): void {
    this.boardColumns.forEach(col => col.tasks = []); // Reset
    if (!this.selectedProject) {
        this.filteredColumns = [...this.boardColumns];
        return;
    };

    this.taskService.getTasksByProject(this.selectedProject).subscribe(tasks => {
      tasks.forEach(task => {
        const column = this.boardColumns.find(col => col.id === task.status);
        if (column) {
          column.tasks.push(task);
        } else {
            // If task has an invalid status, put it in 'To Do'
            this.boardColumns[0].tasks.push(task);
        }
      });
      this.filterTasks();
    });
  }

  filterTasks(): void {
    const searchTerm = this.searchQuery.toLowerCase();
    this.filteredColumns = this.boardColumns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => {
        const matchesMember = !this.selectedBoardMember || task.assignee === this.selectedBoardMember;
        const matchesSearch = !searchTerm || 
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description && task.description.toLowerCase().includes(searchTerm)) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        return matchesMember && matchesSearch;
      })
    }));
  }

  onProjectChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { projectId: this.selectedProject },
      queryParamsHandling: 'merge',
    });
    this.loadBoardTasks();
  }
  
  initPerformanceChart(): void {
    const canvas = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.performanceChart) {
        this.performanceChart.destroy();
    }
    
    this.performanceChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          { label: 'Task Completion', data: [65, 59, 80, 81, 56, 72], borderColor: '#3B82F6', tension: 0.3, fill: true, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
          { label: 'On Time Delivery', data: [80, 78, 90, 85, 95, 92], borderColor: '#10B981', tension: 0.3, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.1)' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  initializeProjectCards(): void {
    this.taskService.getTasks().subscribe(allTasks => {
        this.teamBoards = this.projects.map(project => {
            const projectTasks = allTasks.filter(t => t.projectId === project.id);
            return {
                id: project.id,
                name: project.name,
                description: project.description,
                tasks: projectTasks.length,
                members: this.teamMembers.length, // Or project.teamMembers.length if available
                status: project.status,
                progress: project.progress,
                memberAvatars: this.teamMembers.slice(0, 5).map(m => m.profileImg || 'assets/default-avatar.png')
            };
        });
    });
  }
  
  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task: Task = event.item.data;
    const newStatus = event.container.id;
    const oldStatus = event.previousContainer.id;

    if (oldStatus === newStatus) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      task.status = newStatus as 'todo' | 'in-progress' | 'review' | 'done';
      this.taskService.updateTask(task);
    }
  }

  // Modal and Form Handling
  openAddTaskModal(): void {
    this.newTask = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(),
      projectId: this.selectedProject,
      tags: [],
      storyPoints: 3
    };
    this.addTaskModalOpen = true;
  }

  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task };
    this.editTaskModalOpen = true;
  }

  saveTask(): void {
    if (this.editTaskModalOpen && this.currentTask) {
      this.taskService.updateTask(this.currentTask);
    } else if (this.addTaskModalOpen) {
      this.taskService.addTask(this.newTask as Task);
    }
    this.closeModals();
    this.loadBoardTasks(); // Refresh board
  }

  deleteTask(): void {
    if (this.currentTask) {
      if (confirm(`Are you sure you want to delete the task: "${this.currentTask.title}"?`)) {
        this.taskService.deleteTask(this.currentTask.id);
        this.closeModals();
        this.loadBoardTasks();
      }
    }
  }
  
  viewMemberDetails(member: any): void {
    this.selectedMember = member;
    this.memberDetailsModalOpen = true;
  }
  
  closeModals(): void {
    this.addTaskModalOpen = false;
    this.editTaskModalOpen = false;
    this.memberDetailsModalOpen = false;
    this.currentTask = null;
    this.selectedMember = null;
  }
  
  onEditTagsInputChange(event: any) {
    const value = event.target.value;
    const tags = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    if (this.currentTask) {
      this.currentTask.tags = tags;
    } else {
      this.newTask.tags = tags;
    }
  }
  
  // Utility Functions
  getTotalTasks = (): number => this.boardColumns.reduce((sum, col) => sum + col.tasks.length, 0);
  getCompletedTasks = (): number => this.boardColumns.find(c => c.id === 'done')?.tasks.length || 0;
  getTotalStoryPoints = (columnId: string): number => this.boardColumns.find(c => c.id === columnId)?.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0) || 0;
  getInitials = (name: string): string => name.split(' ').map(n => n[0]).join('').toUpperCase();
  getPriorityColor = (priority: string) => ({ high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }[priority] || 'bg-gray-100 text-gray-800');
  
  // Task counts for member details modal
  getCompletedTasksForMember = (name: string): number => this.getTasksForMemberByStatus(name, 'done');
  getInProgressTasksForMember = (name: string): number => this.getTasksForMemberByStatus(name, 'in-progress');
  getPendingTasksForMember = (name: string): number => this.getTasksForMemberByStatus(name, 'todo') + this.getTasksForMemberByStatus(name, 'review');

  private getTasksForMemberByStatus(memberName: string, status: string): number {
      const column = this.boardColumns.find(col => col.id === status);
      return column ? column.tasks.filter(task => task.assignee === memberName).length : 0;
  }

  getProfileImgForAssignee(assignee: string): string {
    const member = this.teamMembers?.find((m: any) => m.name === assignee);
    return member && member.profileImg ? member.profileImg : 'assets/default-avatar.png';
  }
}