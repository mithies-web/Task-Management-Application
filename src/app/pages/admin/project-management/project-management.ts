import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faPlus, 
  faTimes, 
  faExclamationCircle, 
  faExclamationTriangle, 
  faInfoCircle,
  faFilePdf,
  faFileWord
} from '@fortawesome/free-solid-svg-icons';

interface SprintTask {
  id: string;
  name: string;
  assignee: string;
  dueDate: string;
  status: string;
  priority: string;
  estimatedHours: number;
}

@Component({
  selector: 'app-project-management',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './project-management.html',
  styleUrls: ['./project-management.css']
})
export class ProjectManagement implements OnInit {
  // Font Awesome Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faPlus = faPlus;
  faTimes = faTimes;
  faExclamationCircle = faExclamationCircle;
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faFilePdf = faFilePdf;
  faFileWord = faFileWord;

  // Tabs
  activeTab: string = 'projects';

  // Projects
  projects: any[] = [
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
        // More sprints...
      ]
    },
    // More projects...
  ];
  
  // Sprints
  sprints: any[] = [
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
    }
    // Add more sprints here if needed
  ];

  // Team Leads
  teamLeads: any[] = [
    {
      name: 'Mithies',
      team: 'Development Team',
      projects: ['Website Redesign', 'Mobile App Development', 'Customer Portal Development'],
      status: 'busy'
    },
    {
      name: 'Thirunavukkarasu',
      team: 'Design Team',
      projects: ['Brand Identity Update'],
      status: 'available'
    },
    {
      name: 'Sandeep',
      team: 'Marketing Team',
      projects: ['Marketing Campaign', 'Q2 Promotions'],
      status: 'busy'
    }
  ];

  // Team Members
  teamMembers: any[] = [
    { name: 'Mithies P', role: 'Project Manager' },
    { name: 'Thirunavukkarasu', role: 'UI/UX Designer' },
    { name: 'Sandeep', role: 'Frontend Developer' },
    { name: 'Gokul', role: 'Backend Developer' }
  ];

  // Project Filtering
  searchProjectsTerm: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  teamFilter: string = '';
  filterProjectsDropdown: boolean = false;
  filteredProjects: any[] = [];
  paginatedProjects: any[] = [];

  // Sprint Filtering
  searchSprintsTerm: string = '';
  sprintStatusFilter: string = '';
  sprintProjectFilter: string = '';
  sprintDueDateFilter: string = '';
  filterSprintsDropdown: boolean = false;
  filteredSprints: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  // Team Assignment
  selectedTeam: string = '';
  selectedProjectIdForTeam: string = '';
  selectedTeamLead: any = null;
  filteredProjectsForTeam: any[] = [];

  // Modals
  showAddProjectModal: boolean = false;
  showAddSprintModal: boolean = false;
  showCreateTeamProjectModal: boolean = false;
  showProjectDetailsModal: boolean = false;
  showEditProjectModal: boolean = false;
  showSprintDetailsModal: boolean = false;

  // New Project/Sprint Forms
  newProject: any = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    team: '',
    manager: '',
    priority: 'medium',
    budget: 10000
  };

  newSprint: any = {
    name: '',
    description: '',
    project: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    goal: '',
    selectedTasks: []
  };

  newTeamProject: any = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    team: '',
    manager: '',
    priority: 'medium'
  };

  // Selected Project/Sprint
  selectedProject: any = null;
  selectedSprint: any = null;

  // Team Lead Availability
  teamLeadAvailability: string = '';
  currentTeamLeadProjects: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.filteredProjects = [...this.projects];
    this.filteredSprints = [...this.sprints];
    this.applyProjectsFilters();
    this.applySprintsFilters();
  }

  // Tab Navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Project Filtering
  applyProjectsFilters(): void {
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
    
    this.currentPage = 1;
    this.updatePagination();
  }

  resetProjectsFilters(): void {
    this.searchProjectsTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.teamFilter = '';
    this.applyProjectsFilters();
  }

  createNewSprint() {
    console.log('createNewSprint called');
  }

  // Sprint Filtering
  applySprintsFilters(): void {
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

  resetSprintsFilters(): void {
    this.searchSprintsTerm = '';
    this.sprintStatusFilter = '';
    this.sprintProjectFilter = '';
    this.sprintDueDateFilter = '';
    this.applySprintsFilters();
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProjects.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProjects = this.filteredProjects.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getToEntryNumber(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProjects.length);
  }

  // Team Assignment
  onTeamChange(): void {
    this.selectedProjectIdForTeam = '';
    this.filteredProjectsForTeam = [];
    this.selectedTeamLead = null;
    
    if (this.selectedTeam) {
      const teamName = this.selectedTeam.charAt(0).toUpperCase() + this.selectedTeam.slice(1) + ' Team';
      this.filteredProjectsForTeam = this.projects.filter(p => p.team === teamName);
      
      this.selectedTeamLead = this.teamLeads.find(lead => 
        lead.team.includes(teamName)
      );
    }
  }

  assignProject(): void {
    if (!this.selectedTeam || !this.selectedProjectIdForTeam) {
      alert('Please select both team and project');
      return;
    }
    
    if (this.selectedTeamLead && this.selectedTeamLead.status === 'busy') {
      if (!confirm(`Team lead ${this.selectedTeamLead.name} is currently busy with other projects. Are you sure you want to assign this project?`)) {
        return;
      }
    }
    
    // In a real app, you would save this assignment to your backend
    alert(`Project assigned to ${this.selectedTeamLead.name} successfully!`);
  }

  // Project Management
  openAddProjectModal(): void {
    this.newProject = {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      team: '',
      manager: '',
      priority: 'medium',
      budget: 10000
    };
    this.showAddProjectModal = true;
  }

  createNewProject(): void {
    if (!this.newProject.name || !this.newProject.description || !this.newProject.startDate || 
        !this.newProject.endDate || !this.newProject.team || !this.newProject.manager) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newProject = {
      id: 'P' + Math.floor(1000 + Math.random() * 9000),
      name: this.newProject.name,
      description: this.newProject.description,
      startDate: this.newProject.startDate,
      deadline: this.newProject.endDate,
      team: this.newProject.team,
      manager: this.newProject.manager,
      status: 'planning',
      priority: this.newProject.priority,
      progress: 0,
      budget: this.newProject.budget || 0,
      sprints: [],
      stats: {
        tasksCompleted: 0,
        totalTasks: 0,
        timeSpent: 0,
        estimatedTime: 0,
        budgetUsed: 0,
        totalBudget: this.newProject.budget || 0
      }
    };
    
    this.projects.push(newProject);
    this.filteredProjects = [...this.projects];
    this.applyProjectsFilters();
    this.showAddProjectModal = false;
  }

  viewProjectDetails(projectId: string): void {
    this.selectedProject = this.projects.find(p => p.id === projectId);
    if (this.selectedProject) {
      this.showProjectDetailsModal = true;
    }
  }

  editProject(projectId: string): void {
    this.selectedProject = this.projects.find(p => p.id === projectId);
    if (this.selectedProject) {
      this.showEditProjectModal = true;
    }
  }

  updateProject(): void {
    if (!this.selectedProject.name || !this.selectedProject.description || !this.selectedProject.startDate || 
        !this.selectedProject.deadline || !this.selectedProject.team || !this.selectedProject.manager) {
      alert('Please fill in all required fields');
      return;
    }
    
    const index = this.projects.findIndex(p => p.id === this.selectedProject.id);
    if (index !== -1) {
      this.projects[index] = {...this.selectedProject};
      this.filteredProjects = [...this.projects];
      this.applyProjectsFilters();
      this.showEditProjectModal = false;
      this.showProjectDetailsModal = false;
    }
  }

  deleteProject(): void {
    if (confirm(`Are you sure you want to delete project ${this.selectedProject.id}? This action cannot be undone.`)) {
      const index = this.projects.findIndex(p => p.id === this.selectedProject.id);
      if (index !== -1) {
        this.projects.splice(index, 1);
        this.filteredProjects = [...this.projects];
        this.applyProjectsFilters();
      }
      this.showProjectDetailsModal = false;
      this.showEditProjectModal = false;
    }
  }

  viewSprintDetails(sprintId: string): void {
    this.selectedSprint = this.sprints.find(s => s.id === sprintId);
    if (this.selectedSprint) {
      this.showSprintDetailsModal = true;
    }
  }

  editSprint(sprintId: string): void {
    this.selectedSprint = this.sprints.find(s => s.id === sprintId);
    if (this.selectedSprint) {
      // In a real app, you would open an edit modal here
      alert(`Edit sprint functionality would open here for sprint ${sprintId}`);
    }
  }

  deleteSprint(): void {
    if (confirm(`Are you sure you want to delete sprint ${this.selectedSprint.id}? This action cannot be undone.`)) {
      const index = this.sprints.findIndex(s => s.id === this.selectedSprint.id);
      if (index !== -1) {
        this.sprints.splice(index, 1);
        this.filteredSprints = [...this.sprints];
        this.applySprintsFilters();
        this.showSprintDetailsModal = false;
      }
    }
  }

  // Team Project Management
  openCreateTeamProjectModal(): void {
    this.newTeamProject = {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      team: '',
      manager: '',
      priority: 'medium'
    };
    this.teamLeadAvailability = '';
    this.showCreateTeamProjectModal = true;
  }

  checkTeamLeadAvailability(): void {
    if (this.newTeamProject.manager && this.newTeamProject.team) {
      const teamLead = this.teamLeads.find(lead => 
        lead.name === (this.newTeamProject.manager === 'john' ? 'John Doe' : 
                      this.newTeamProject.manager === 'jane' ? 'Jane Smith' : 'Mike Johnson')
      );
      
      if (teamLead) {
        this.teamLeadAvailability = teamLead.status;
        this.currentTeamLeadProjects = teamLead.projects.length;
      }
    } else {
      this.teamLeadAvailability = '';
    }
  }

  createTeamProject(): void {
    if (!this.newTeamProject.name || !this.newTeamProject.description || !this.newTeamProject.startDate || 
        !this.newTeamProject.endDate || !this.newTeamProject.team || !this.newTeamProject.manager) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newProject = {
      id: 'P' + Math.floor(1000 + Math.random() * 9000),
      name: this.newTeamProject.name,
      description: this.newTeamProject.description,
      startDate: this.newTeamProject.startDate,
      deadline: this.newTeamProject.endDate,
      team: `${this.newTeamProject.team.charAt(0).toUpperCase() + this.newTeamProject.team.slice(1)} Team`,
      manager: this.newTeamProject.manager === 'john' ? 'John Doe' : 
              this.newTeamProject.manager === 'jane' ? 'Jane Smith' : 'Mike Johnson',
      status: 'planning',
      priority: this.newTeamProject.priority,
      progress: 0,
      stats: {
        tasksCompleted: 0,
        totalTasks: 0,
        timeSpent: 0,
        estimatedTime: 0,
        budgetUsed: 0,
        totalBudget: 0
      }
    };
    
    this.projects.push(newProject);
    this.filteredProjects = [...this.projects];
    this.applyProjectsFilters();
    this.showCreateTeamProjectModal = false;
  }

  // File Handling
  onFileSelected(event: any): void {
    const files = event.target.files;
    console.log('Files selected:', files);
    // In a real app, you would handle file upload here
  }

  onTeamProjectFileSelected(event: any): void {
    const files = event.target.files;
    console.log('Team project files selected:', files);
    // In a real app, you would handle file upload here
  }

  // Utility Functions
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'planning': return 'status-planning';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'on-hold': return 'status-on-hold';
      default: return '';
    }
  }

  getPriorityIcon(priority: string): any {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  }

  getSprintBorderClass(status: string): string {
    switch (status) {
      case 'active': return 'sprint-active';
      case 'completed': return 'sprint-completed';
      case 'upcoming': return 'sprint-upcoming';
      default: return '';
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  calculateDaysRemaining(endDate: string): number {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateSprintProgress(sprint: any): number {
    if (!sprint) return 0;
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  }

  // Modal Management
  closeAllModals(): void {
    this.showAddProjectModal = false;
    this.showAddSprintModal = false;
    this.showCreateTeamProjectModal = false;
    this.showProjectDetailsModal = false;
    this.showEditProjectModal = false;
    this.showSprintDetailsModal = false;
  }
}