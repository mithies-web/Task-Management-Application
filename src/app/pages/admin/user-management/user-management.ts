import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faEye, 
  faEdit, 
  faTrashAlt, 
  faPlus, 
  faFilter, 
  faSearch,
  faChevronRight,
  faUsers,
  faProjectDiagram,
  faFileAlt,
  faChartBar,
  faChartLine,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { Project, Team, User } from '../../../model/user.model';
import { UserService } from '../../../core/services/user';
import { TeamService } from '../../../core/services/team';
import { ProjectService } from '../../../core/services/project';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [UserService, TeamService, ProjectService],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {
  // Font Awesome icons
  faEye = faEye;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faPlus = faPlus;
  faFilter = faFilter;
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faUsers = faUsers;
  faProjectDiagram = faProjectDiagram;
  faFileAlt = faFileAlt;
  faChartBar = faChartBar;
  faChartLine = faChartLine;
  faCog = faCog;

  // Data
  users: User[] = [];
  teams: Team[] = [];
  projects: Project[] = [];
  filteredUsers: User[] = [];
  teamLeads: any[] = []; 
  
  // UI State
  activeTab: 'users' | 'teams' | 'performance' = 'users';
  currentPage = 1;
  itemsPerPage = 5;
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  selectedTeam = '';
  showFilterDropdown = false;
  expandedTeams: Set<string> = new Set();

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.users = this.userService.getUsers();
    this.teams = this.teamService.getTeams();
    this.projects = this.projectService.getProjects();
    this.filteredUsers = [...this.users];
  }

  // Tab switching
  switchTab(tab: 'users' | 'teams' | 'performance'): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  // Filtering
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = 
        (user.name && user.name.toLowerCase().includes(this.searchTerm.toLowerCase())) || 
        (user.email && user.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      const matchesTeam = !this.selectedTeam || user.team === this.selectedTeam;

      return matchesSearch && matchesRole && matchesStatus && matchesTeam;
    });
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedTeam = '';
    this.filteredUsers = [...this.users];
    this.showFilterDropdown = false;
    this.currentPage = 1;
  }

  // Pagination
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  getToEntryNumber(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
}

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Team hierarchy
  toggleTeamExpansion(teamId: string): void {
    if (this.expandedTeams.has(teamId)) {
      this.expandedTeams.delete(teamId);
    } else {
      this.expandedTeams.add(teamId);
    }
  }

  isTeamExpanded(teamId: string): boolean {
    return this.expandedTeams.has(teamId);
  }

  getSubTeams(teamId: string): Team[] {
    return this.teams.filter(team => team.parentTeam === teamId);
  }

  // User actions
  viewUser(user: User): void {
    console.log('View user:', user);
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user.id);
      this.loadData();
    }
  }

  // Status styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Team actions
  viewTeam(team: Team): void {
    console.log('View team:', team);
  }

  addSubTeam(team: Team): void {
    console.log('Add sub-team to:', team);
  }
}