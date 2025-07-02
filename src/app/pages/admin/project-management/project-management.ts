import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faFilter, faSearch, faTimes, faExclamationCircle, faExclamationTriangle, faInfoCircle, faBars, faBell, faSignOutAlt, faTachometerAlt, faUsers, faProjectDiagram, faFileAlt, faChartBar, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  team: string;
  manager: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  budget: number;
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    timeSpent: number;
    estimatedTime: number;
    budgetUsed: number;
    totalBudget: number;
  };
  sprints: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'upcoming' | 'completed';
    goal: string;
  }[];
}

interface Sprint {
  id: string;
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  goal: string;
  description: string;
  tasks: {
    id: string;
    name: string;
    assignee: string;
    dueDate: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'high' | 'medium' | 'low';
    estimatedHours: number;
  }[];
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    timeSpent: number;
    estimatedTime: number;
  };
}

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './project-management.html',
  styleUrls: ['./project-management.css']
})
export class ProjectManagementComponent implements OnInit {
  // Font Awesome Icons
  faPlus = faPlus;
  faFilter = faFilter;
  faSearch = faSearch;
  faTimes = faTimes;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faBars = faBars;
  faBell = faBell;
  faSignOutAlt = faSignOutAlt;
  faTachometerAlt = faTachometerAlt;
  faUsers = faUsers;
  faProjectDiagram = faProjectDiagram;
  faFileAlt = faFileAlt;
  faChartBar = faChartBar;
  faChartLine = faChartLine;
  faCog = faCog;

  // Tab management
  activeTab: 'projects' | 'sprints' | 'team-projects' = 'projects';

  // Projects data
  projects: Project[] = [
    {
      id: 'P1001',
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX and improved performance',
      startDate: '2023-05-01',
      deadline: '2023-07-15',
      team: 'Development Team',
      manager: 'John Doe',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      budget: 10000,
      stats: {
        tasksCompleted: 1,
        totalTasks: 4,
        timeSpent: 120,
        estimatedTime: 200,
        budgetUsed: 5000,
        totalBudget: 10000
      },
      sprints: [
        { id: 'S101', name: 'UI Design', startDate: '2023-05-01', endDate: '2023-05-14', status: 'completed', goal: 'Complete all UI designs for the website' },
        { id: 'S102', name: 'Frontend Development', startDate: '2023-05-15', endDate: '2023-06-01', status: 'active', goal: 'Implement frontend components' },
        { id: 'S103', name: 'Backend Integration', startDate: '2023-06-02', endDate: '2023-06-20', status: 'upcoming', goal: 'Connect frontend with backend APIs' }
      ]
    },
    // Add more sample projects as needed
  ];

  sprints: Sprint[] = [
    {
      id: 'S101',
      name: 'UI Design',
      project: 'Website Redesign',
      startDate: '2023-05-01',
      endDate: '2023-05-14',
      status: 'completed',
      goal: 'Complete all UI designs for the website',
      description: 'This sprint focuses on creating all the UI designs for the website redesign project.',
      tasks: [
        { id: 'T101', name: 'Design Homepage', assignee: 'Jane Smith', dueDate: '2023-05-05', status: 'done', priority: 'high', estimatedHours: 20 },
        { id: 'T102', name: 'Design Product Pages', assignee: 'Jane Smith', dueDate: '2023-05-10', status: 'done', priority: 'medium', estimatedHours: 15 },
        { id: 'T103', name: 'Design Admin Dashboard', assignee: 'Mike Johnson', dueDate: '2023-05-12', status: 'done', priority: 'low', estimatedHours: 10 }
      ],
      stats: {
        tasksCompleted: 3,
        totalTasks: 3,
        timeSpent: 45,
        estimatedTime: 45
      }
    },
    // Add more sample sprints as needed
  ];

  // Filter and pagination variables
  filteredProjects: Project[] = [];
  filteredSprints: Sprint[] = [];
  projectsPerPage = 5;
  currentProjectsPage = 1;
  searchProjectsTerm = '';
  searchSprintsTerm = '';
  statusFilter = '';
  priorityFilter = '';
  teamFilter = '';
  sprintStatusFilter = '';
  sprintProjectFilter = '';
  sprintDueDateFilter = '';

  // Modal states
  showAddProjectModal = false;
  showAddSprintModal = false;
  showProjectDetailsModal = false;
  showEditProjectModal = false;
  showSprintDetailsModal = false;
  showEditSprintModal = false;
  showCreateTeamProjectModal = false;

  // Current selected items
  currentProject: Project | null = null;
  currentSprint: Sprint | null = null;

  ngOnInit(): void {
    this.filteredProjects = [...this.projects];
    this.filteredSprints = [...this.sprints];
  }

  // Tab management
  setActiveTab(tab: 'projects' | 'sprints' | 'team-projects') {
    this.activeTab = tab;
  }

  // Project filtering and pagination
  applyProjectsFilters() {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(this.searchProjectsTerm.toLowerCase()) || 
        project.team.toLowerCase().includes(this.searchProjectsTerm.toLowerCase()) ||
        project.manager.toLowerCase().includes(this.searchProjectsTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || project.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || project.priority === this.priorityFilter;
      const matchesTeam = !this.teamFilter || project.team === this.teamFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
    });
    
    this.currentProjectsPage = 1;
  }

  resetProjectsFilters() {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.teamFilter = '';
    this.searchProjectsTerm = '';
    this.applyProjectsFilters();
  }

  // Sprint filtering
  applySprintsFilters() {
    this.filteredSprints = this.sprints.filter(sprint => {
      const matchesSearch = 
        sprint.name.toLowerCase().includes(this.searchSprintsTerm.toLowerCase()) || 
        sprint.project.toLowerCase().includes(this.searchSprintsTerm.toLowerCase());
      
      const matchesStatus = !this.sprintStatusFilter || sprint.status === this.sprintStatusFilter;
      const matchesProject = !this.sprintProjectFilter || sprint.project === this.sprintProjectFilter;
      
      // Handle due date filter
      let matchesDueDate = true;
      if (this.sprintDueDateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sprintEndDate = new Date(sprint.endDate);
        
        if (this.sprintDueDateFilter === 'today') {
          matchesDueDate = sprintEndDate.getTime() === today.getTime();
        } else if (this.sprintDueDateFilter === 'week') {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + 7);
          matchesDueDate = sprintEndDate >= today && sprintEndDate <= endOfWeek;
        } else if (this.sprintDueDateFilter === 'overdue') {
          matchesDueDate = sprintEndDate < today && sprint.status !== 'completed';
        }
      }
      
      return matchesSearch && matchesStatus && matchesProject && matchesDueDate;
    });
  }

  resetSprintsFilters() {
    this.sprintStatusFilter = '';
    this.sprintProjectFilter = '';
    this.sprintDueDateFilter = '';
    this.searchSprintsTerm = '';
    this.applySprintsFilters();
  }

  // Modal management
  openAddProjectModal() {
    this.showAddProjectModal = true;
  }

  openAddSprintModal() {
    this.showAddSprintModal = true;
  }

  openCreateTeamProjectModal() {
    this.showCreateTeamProjectModal = true;
  }

  viewProjectDetails(projectId: string) {
    this.currentProject = this.projects.find(p => p.id === projectId) || null;
    this.showProjectDetailsModal = true;
  }

  editProject(projectId: string) {
    this.currentProject = this.projects.find(p => p.id === projectId) || null;
    this.showEditProjectModal = true;
  }

  viewSprintDetails(sprintId: string) {
    this.currentSprint = this.sprints.find(s => s.id === sprintId) || null;
    this.showSprintDetailsModal = true;
  }

  closeAllModals() {
    this.showAddProjectModal = false;
    this.showAddSprintModal = false;
    this.showProjectDetailsModal = false;
    this.showEditProjectModal = false;
    this.showSprintDetailsModal = false;
    this.showCreateTeamProjectModal = false;
    this.currentProject = null;
    this.currentSprint = null;
  }

  oal!: string;

  // Add this method to safely get initials from a name
  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n && n.length > 0 ? n[0] : '')
      .join('')
      .toUpperCase();
  }

  // Add this method to handle saving project changes from the edit modal
  saveProjectChanges(): void {
    // Implement your save logic here, e.g., update the project in your data source
    // Example:
    // this.updateProject(this.currentProject);
    // Optionally close the modal after saving
    this.closeAllModals();
  }

  // Add this method to handle project deletion
  deleteProject(): void {
    if (this.currentProject) {
      // Remove the project from the projects array
      this.projects = this.projects.filter(p => p.id !== this.currentProject?.id);
      // Optionally, update filteredProjects if you use filtering
      if (this.filteredProjects) {
        this.filteredProjects = this.filteredProjects.filter(p => p.id !== this.currentProject?.id);
      }
      // Close the modal
      this.closeAllModals();
    }
  }

  // Controls the visibility of the projects filter dropdown
  filterProjectsDropdown: boolean = false;

  // Expose Math to the template
  Math = Math;

  // Add this method to support pagination in the template
  getPagesArray(): number[] {
    const totalPages = Math.ceil(this.filteredProjects.length / this.projectsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  filterSprintsDropdown: boolean = false;

  // Add this method to handle editing a sprint
  editSprint(sprintId: string | number): void {
    // You can implement your logic here, e.g. open a modal and set the current sprint
    const sprint = this.sprints?.find((s: any) => s.id === sprintId);
    if (sprint) {
      this.currentSprint = sprint;
      this.showEditSprintModal = true;
    }
  }


  // Returns the number of days remaining from today to the given end date
  getDaysRemaining(endDate: string | Date): number {
    const today = new Date();
    const end = new Date(endDate);
    // Set time to midnight for accurate day difference
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - today.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }


  // Returns the sprint completion percentage based on tasks completed vs total tasks
  getSprintCompletionPercentage(sprint: any): number {
    if (!sprint || !sprint.stats || !sprint.stats.totalTasks || sprint.stats.totalTasks === 0) {
      return 0;
    }
    return Math.round((sprint.stats.tasksCompleted / sprint.stats.totalTasks) * 100);
  }

  // Add this method to handle sprint deletion
  deleteSprint(): void {
    // TODO: Implement actual deletion logic, e.g., call a service to delete the sprint
    // For now, just close the modal or show a confirmation
    this.closeAllModals();
  }


  // Utility functions
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'planning': return 'status-planning';
      case 'on-hold': return 'status-on-hold';
      case 'active': return 'sprint-active';
      case 'upcoming': return 'sprint-upcoming';
      default: return '';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  }
}