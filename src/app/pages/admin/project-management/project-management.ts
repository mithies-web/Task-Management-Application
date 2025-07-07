import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
  faFileWord,
  faTrashAlt,
  faEdit,
  faEye,
  faUsers,
  faProjectDiagram,
  faTasks
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
  faTrashAlt = faTrashAlt;
  faEye = faEye;
  faEdit = faEdit;
  faUsers = faUsers;
  faProjectDiagram = faProjectDiagram;
  faTasks = faTasks;

  // Form Groups
  projectForm: FormGroup;
  sprintForm: FormGroup;
  teamProjectForm: FormGroup;
  editProjectForm: FormGroup;
  editSprintForm: FormGroup;

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
        {
          id: 'S102',
          name: 'Frontend Development',
          project: 'Website Redesign',
          startDate: '2023-05-15',
          endDate: '2023-05-28',
          status: 'active',
          goal: 'Implement all frontend components',
          description: 'This sprint focuses on developing the frontend based on the designs.',
          tasks: [
            { id: 'T201', name: 'Develop Homepage', assignee: 'Sandeep', dueDate: '2023-05-20', status: 'in-progress', priority: 'high', estimatedHours: 30 },
            { id: 'T202', name: 'Develop Product Pages', assignee: 'Gokul', dueDate: '2023-05-25', status: 'todo', priority: 'medium', estimatedHours: 25 }
          ],
          stats: {
            tasksCompleted: 0,
            totalTasks: 2,
            timeSpent: 15,
            estimatedTime: 55
          }
        }
      ]
    },
    {
      id: 'P1002',
      name: 'Mobile App Development',
      description: 'Development of a cross-platform mobile application for iOS and Android',
      startDate: '2023-06-01',
      deadline: '2023-09-30',
      team: 'Development Team',
      manager: 'John Doe',
      status: 'planning',
      priority: 'medium',
      progress: 10,
      budget: 15000,
      stats: {
        tasksCompleted: 2,
        totalTasks: 15,
        timeSpent: 40,
        estimatedTime: 400,
        budgetUsed: 2000,
        totalBudget: 15000
      },
      sprints: []
    }
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
    },
    {
      id: 'S102',
      name: 'Frontend Development',
      project: 'Website Redesign',
      startDate: '2023-05-15',
      endDate: '2023-05-28',
      status: 'active',
      goal: 'Implement all frontend components',
      description: 'This sprint focuses on developing the frontend based on the designs.',
      tasks: [
        { id: 'T201', name: 'Develop Homepage', assignee: 'Sandeep', dueDate: '2023-05-20', status: 'in-progress', priority: 'high', estimatedHours: 30 },
        { id: 'T202', name: 'Develop Product Pages', assignee: 'Gokul', dueDate: '2023-05-25', status: 'todo', priority: 'medium', estimatedHours: 25 }
      ],
      stats: {
        tasksCompleted: 0,
        totalTasks: 2,
        timeSpent: 15,
        estimatedTime: 55
      }
    }
  ];

  // Team Leads
  teamLeads: any[] = [
    {
      name: 'John Doe',
      team: 'Development Team',
      projects: ['Website Redesign', 'Mobile App Development', 'Customer Portal Development'],
      status: 'busy'
    },
    {
      name: 'Jane Smith',
      team: 'Design Team',
      projects: ['Brand Identity Update'],
      status: 'available'
    },
    {
      name: 'Mike Johnson',
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
  showEditSprintModal: boolean = false;

  // Selected Project/Sprint
  selectedProject: any = null;
  selectedSprint: any = null;

  // Team Lead Availability
  teamLeadAvailability: string = '';
  currentTeamLeadProjects: number = 0;

  constructor() {
    // Initialize form groups
    this.projectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      team: new FormControl('', Validators.required),
      manager: new FormControl('', Validators.required),
      priority: new FormControl('medium'),
      budget: new FormControl(10000, [Validators.required, Validators.min(0)])
    });

    this.sprintForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(''),
      project: new FormControl('', Validators.required),
      status: new FormControl('upcoming'),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      goal: new FormControl(''),
      selectedTasks: new FormControl([])
    });

    this.teamProjectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      team: new FormControl('', Validators.required),
      manager: new FormControl('', Validators.required),
      priority: new FormControl('medium')
    });

    this.editProjectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      startDate: new FormControl('', Validators.required),
      deadline: new FormControl('', Validators.required),
      team: new FormControl('', Validators.required),
      manager: new FormControl('', Validators.required),
      status: new FormControl('planning'),
      priority: new FormControl('medium'),
      progress: new FormControl(0, [Validators.min(0), Validators.max(100)]),
      budget: new FormControl(0, [Validators.required, Validators.min(0)])
    });

    this.editSprintForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(''),
      project: new FormControl('', Validators.required),
      status: new FormControl('upcoming'),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      goal: new FormControl(''),
      selectedTasks: new FormControl([])
    });
  }

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

  toggleProjectsFilter(): void {
    this.filterProjectsDropdown = !this.filterProjectsDropdown;
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
    this.projectForm.reset({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      team: '',
      manager: '',
      priority: 'medium',
      budget: 10000
    });
    this.showAddProjectModal = true;
  }

  createNewProject(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      return;
    }
    
    const newProject = {
      id: 'P' + Math.floor(1000 + Math.random() * 9000),
      name: this.projectForm.value.name,
      description: this.projectForm.value.description,
      startDate: this.projectForm.value.startDate,
      deadline: this.projectForm.value.endDate,
      team: this.projectForm.value.team,
      manager: this.projectForm.value.manager,
      status: 'planning',
      priority: this.projectForm.value.priority,
      progress: 0,
      budget: this.projectForm.value.budget || 0,
      sprints: [],
      stats: {
        tasksCompleted: 0,
        totalTasks: 0,
        timeSpent: 0,
        estimatedTime: 0,
        budgetUsed: 0,
        totalBudget: this.projectForm.value.budget || 0
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
      this.editProjectForm.patchValue({
        name: this.selectedProject.name,
        description: this.selectedProject.description,
        startDate: this.selectedProject.startDate,
        deadline: this.selectedProject.deadline,
        team: this.selectedProject.team,
        manager: this.selectedProject.manager,
        status: this.selectedProject.status,
        priority: this.selectedProject.priority,
        progress: this.selectedProject.progress,
        budget: this.selectedProject.budget
      });
      this.showEditProjectModal = true;
    }
  }

  updateProject(): void {
    if (this.editProjectForm.invalid) {
      this.markFormGroupTouched(this.editProjectForm);
      return;
    }
    
    const index = this.projects.findIndex(p => p.id === this.selectedProject.id);
    if (index !== -1) {
      this.projects[index] = {
        ...this.projects[index],
        name: this.editProjectForm.value.name,
        description: this.editProjectForm.value.description,
        startDate: this.editProjectForm.value.startDate,
        deadline: this.editProjectForm.value.deadline,
        team: this.editProjectForm.value.team,
        manager: this.editProjectForm.value.manager,
        status: this.editProjectForm.value.status,
        priority: this.editProjectForm.value.priority,
        progress: this.editProjectForm.value.progress,
        budget: this.editProjectForm.value.budget
      };
      
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
      this.editSprintForm.patchValue({
        name: this.selectedSprint.name,
        description: this.selectedSprint.description,
        project: this.selectedSprint.project,
        status: this.selectedSprint.status,
        startDate: this.selectedSprint.startDate,
        endDate: this.selectedSprint.endDate,
        goal: this.selectedSprint.goal,
        selectedTasks: this.selectedSprint.tasks.map((t: any) => t.name)
      });
      this.showEditSprintModal = true;
    }
  }

  updateSprint(): void {
    if (this.editSprintForm.invalid) {
      this.markFormGroupTouched(this.editSprintForm);
      return;
    }
    
    const index = this.sprints.findIndex(s => s.id === this.selectedSprint.id);
    if (index !== -1) {
      this.sprints[index] = {
        ...this.sprints[index],
        name: this.editSprintForm.value.name,
        description: this.editSprintForm.value.description,
        project: this.editSprintForm.value.project,
        status: this.editSprintForm.value.status,
        startDate: this.editSprintForm.value.startDate,
        endDate: this.editSprintForm.value.endDate,
        goal: this.editSprintForm.value.goal,
        tasks: this.editSprintForm.value.selectedTasks.map((taskName: string) => ({
          id: 'T' + Math.floor(100 + Math.random() * 900),
          name: taskName,
          assignee: 'Unassigned',
          dueDate: this.editSprintForm.value.endDate,
          status: 'todo',
          priority: 'medium',
          estimatedHours: 0
        }))
      };
      
      this.filteredSprints = [...this.sprints];
      this.applySprintsFilters();
      this.showEditSprintModal = false;
      this.showSprintDetailsModal = false;
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

  createNewSprint(): void {
    if (this.sprintForm.invalid) {
      this.markFormGroupTouched(this.sprintForm);
      return;
    }
    
    const newSprint = {
      id: 'S' + Math.floor(100 + Math.random() * 900),
      name: this.sprintForm.value.name,
      description: this.sprintForm.value.description,
      project: this.sprintForm.value.project,
      status: this.sprintForm.value.status,
      startDate: this.sprintForm.value.startDate,
      endDate: this.sprintForm.value.endDate,
      goal: this.sprintForm.value.goal,
      tasks: this.sprintForm.value.selectedTasks.map((taskName: string) => ({
        id: 'T' + Math.floor(100 + Math.random() * 900),
        name: taskName,
        assignee: 'Unassigned',
        dueDate: this.sprintForm.value.endDate,
        status: 'todo',
        priority: 'medium',
        estimatedHours: 0
      })),
      stats: {
        tasksCompleted: 0,
        totalTasks: this.sprintForm.value.selectedTasks.length,
        timeSpent: 0,
        estimatedTime: 0
      }
    };
    
    this.sprints.push(newSprint);
    this.filteredSprints = [...this.sprints];
    this.applySprintsFilters();
    this.showAddSprintModal = false;
  }

  // Team Project Management
  openCreateTeamProjectModal(): void {
    this.teamProjectForm.reset({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      team: '',
      manager: '',
      priority: 'medium'
    });
    this.teamLeadAvailability = '';
    this.showCreateTeamProjectModal = true;
  }

  checkTeamLeadAvailability(): void {
    if (this.teamProjectForm.value.manager && this.teamProjectForm.value.team) {
      const teamLead = this.teamLeads.find(lead => 
        lead.name === (this.teamProjectForm.value.manager === 'john' ? 'John Doe' : 
                      this.teamProjectForm.value.manager === 'jane' ? 'Jane Smith' : 'Mike Johnson')
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
    if (this.teamProjectForm.invalid) {
      this.markFormGroupTouched(this.teamProjectForm);
      return;
    }
    
    const newProject = {
      id: 'P' + Math.floor(1000 + Math.random() * 9000),
      name: this.teamProjectForm.value.name,
      description: this.teamProjectForm.value.description,
      startDate: this.teamProjectForm.value.startDate,
      deadline: this.teamProjectForm.value.endDate,
      team: `${this.teamProjectForm.value.team.charAt(0).toUpperCase() + this.teamProjectForm.value.team.slice(1)} Team`,
      manager: this.teamProjectForm.value.manager === 'john' ? 'John Doe' : 
              this.teamProjectForm.value.manager === 'jane' ? 'Jane Smith' : 'Mike Johnson',
      status: 'planning',
      priority: this.teamProjectForm.value.priority,
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
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

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
    this.showEditSprintModal = false;
  }
}