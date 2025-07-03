// user-management.ts
import { Component, OnInit } from '@angular/core';
import { faUsers, faProjectDiagram, faChartLine, faSearch, faFilter, faPlus, faEye, faEdit, faTrashAlt, faTimes, faPhoneAlt, faInfoCircle, faUserFriends, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Team, TeamHierarchy, User, UserRole } from '../../../model/user.model';
import { UserService } from '../../../core/services/user/user';
import { TeamService } from '../../../core/services/team/team';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  imports: [
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {
  // Icons
  faUsers = faUsers;
  faProjectDiagram = faProjectDiagram;
  faChartLine = faChartLine;
  faSearch = faSearch;
  faFilter = faFilter;
  faPlus = faPlus;
  faEye = faEye;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faTimes = faTimes;
  faPhoneAlt = faPhoneAlt;
  faInfoCircle = faInfoCircle;
  faUserFriends = faUserFriends;
  faChevronRight = faChevronRight;

  // Tabs
  activeTab: 'users' | 'teams' | 'performance' = 'users';

  // Users Tab
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  selectedTeams = '';
  showFilterDropdown = false;
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  memberSearchTerm: string = '';

  // Teams Tab
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  teamSearchTerm = '';
  expandedTeams: string[] = [];

  // Performance Tab
  teamLeads: User[] = [];
  topPerformers: User[] = [];

  // Modals
  showUserDetailsModal = false;
  showEditUserModal = false;
  showAddUserModal = false;
  showAddTeamModal = false;
  showAddSubTeamModal = false;
  showTeamDetailsModal = false;
  showEditTeamModal = false;

  // Add Member Modal
  showAddMemberModal = false;
  selectedMembers: User[] = [];
  availableMembers: User[] = [];
  isAddingMembers: boolean = false;

  // Selected items
  selectedUser: User = {
    id: '',
    email: '',
    name: '',
    username: '',
    role: UserRole.USER,
    status: 'active'
  };
  selectedTeam: Team | null = null;

  // New items
  newUser: Partial<User> = {
    role: UserRole.USER,
    status: 'active',
    employeeType: 'full-time',
    location: 'remote'
  };
  newTeam: Partial<Team> = {
    members: 0,
    projects: 0,
    completionRate: 0
  };
  newSubTeam: Partial<Team> = {
    members: 0,
    projects: 0,
    completionRate: 0
  };

  constructor(
    private userService: UserService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadPerformanceData();
  }

  // Tab switching
  switchTab(tab: 'users' | 'teams' | 'performance'): void {
    this.activeTab = tab;
    if (tab === 'teams') {
      this.loadTeams();
    } else if (tab === 'performance') {
      this.loadPerformanceData();
    }
  }

  // Users Tab methods
  loadUsers(): void {
    this.users = this.userService.getUsers();
    this.filteredUsers = [...this.users];
    this.updatePagination();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      const matchesTeam = !this.selectedTeam || user.team === this.selectedTeams;
      
      return matchesSearch && matchesRole && matchesStatus && matchesTeam;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedTeams = '';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getToEntryNumber(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredUsers.length ? this.filteredUsers.length : end;
  }

  // User actions
  viewUserDetails(user: User): void {
    this.selectedUser = { ...user };
    this.showUserDetailsModal = true;
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.showEditUserModal = true;
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user.id);
      this.loadUsers();
      this.closeModals();
    }
  }

  saveUser(): void {
    this.userService.updateUser(this.selectedUser);
    this.loadUsers();
    this.closeModals();
  }

  openAddUserModal(): void {
    this.newUser = {
      role: UserRole.USER,
      status: 'active',
      employeeType: 'full-time',
      location: 'remote'
    };
    this.showAddUserModal = true;
  }

  createUser(): void {
    if (this.newUser.name && this.newUser.email && this.newUser.password) {
      const newUser: User = {
        id: (this.users.length + 1).toString(),
        name: this.newUser.name,
        email: this.newUser.email,
        username: this.newUser.username || this.newUser.email.split('@')[0],
        password: this.newUser.password,
        role: this.newUser.role || UserRole.USER,
        status: this.newUser.status || 'active',
        team: this.newUser.team || null,
        phone: this.newUser.phone,
        gender: this.newUser.gender,
        dob: this.newUser.dob,
        department: this.newUser.department,
        employeeType: this.newUser.employeeType,
        location: this.newUser.location,
        joinDate: this.newUser.joinDate || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        address: this.newUser.address,
        about: this.newUser.about,
        profileImg: this.newUser.profileImg || 'assets/images/default-profile.png'
      };
      
      this.userService.addUser(newUser);
      this.loadUsers();
      this.closeModals();
    }
  }

  // Teams Tab methods
  loadTeams(): void {
    this.teams = this.teamService.getTeams();
    this.filteredTeams = [...this.teams];
    
    // Debug log to check if teams are loading
    console.log('Teams loaded:', this.teams);
  }

  filterTeams(): void {
    if (!this.teamSearchTerm) {
      this.filteredTeams = [...this.teams];
    } else {
      this.filteredTeams = this.teams.filter(team => 
        team.name.toLowerCase().includes(this.teamSearchTerm.toLowerCase()) ||
        (team.department && team.department.toLowerCase().includes(this.teamSearchTerm.toLowerCase())) ||
        (team.lead && team.lead.toLowerCase().includes(this.teamSearchTerm.toLowerCase()))
      );
    }
  }

  toggleTeamExpansion(teamId: string): void {
    const index = this.expandedTeams.indexOf(teamId);
    if (index === -1) {
      this.expandedTeams.push(teamId);
    } else {
      this.expandedTeams.splice(index, 1);
    }
  }

  isTeamExpanded(teamId: string): boolean {
    return this.expandedTeams.includes(teamId);
  }

  getSubTeams(teamId: string): Team[] {
    return this.teams.filter(team => team.parentTeam === teamId);
  }

  openAddTeamModal(): void {
    this.newTeam = {
      members: 0,
      projects: 0,
      completionRate: 0
    };
    this.showAddTeamModal = true;
  }

  openAddSubTeamModal(): void {
    this.newSubTeam = {
      members: 0,
      projects: 0,
      completionRate: 0
    };
    this.showAddSubTeamModal = true;
  }

  addSubTeam(team: Team): void {
    this.newSubTeam = {
      parentTeam: team.name,
      members: 0,
      projects: 0,
      completionRate: 0
    };
    this.showAddSubTeamModal = true;
  }

  createTeam(): void {
    if (this.newTeam.name && this.newTeam.department) {
      const newTeam: Team = {
        id: (this.teams.length + 1).toString(),
        name: this.newTeam.name,
        department: this.newTeam.department,
        lead: this.newTeam.lead,
        members: this.newTeam.members || 0,
        projects: this.newTeam.projects || 0,
        completionRate: this.newTeam.completionRate || 0,
        description: this.newTeam.description,
        parentTeam: this.newTeam.parentTeam || null
      };
      
      this.teamService.addTeam(newTeam);
      this.loadTeams();
      this.closeModals();
    }
  }

  createSubTeam(): void {
    if (this.newSubTeam.name && this.newSubTeam.parentTeam) {
      const newSubTeam: Team = {
        id: (this.teams.length + 1).toString(),
        name: this.newSubTeam.name,
        department: this.teams.find(t => t.name === this.newSubTeam.parentTeam)?.department || '',
        lead: this.newSubTeam.lead,
        members: this.newSubTeam.members || 0,
        projects: this.newSubTeam.projects || 0,
        completionRate: this.newSubTeam.completionRate || 0,
        description: this.newSubTeam.description,
        parentTeam: this.newSubTeam.parentTeam
      };
      
      this.teamService.addTeam(newSubTeam);
      this.loadTeams();
      this.closeModals();
    }
  }

  viewTeamDetails(team: Team): void {
    this.selectedTeam = { ...team };
    this.showTeamDetailsModal = true;
  }

  // In your component class
  editTeam(team: Team): void {
    // Create a deep copy of the team to avoid reference issues
    this.selectedTeam = JSON.parse(JSON.stringify(team));
    this.showEditTeamModal = true;
  }

  async saveTeamEdits(): Promise<void> {
    if (!this.selectedTeam) return;

    try {
      // Update the team in the service
      await this.teamService.updateTeam(this.selectedTeam);
      
      // Update the team in the local array
      const index = this.teams.findIndex(t => t.id === this.selectedTeam?.id);
      if (index !== -1) {
        this.teams[index] = {...this.selectedTeam};
      }
      
      // Update filtered teams if needed
      this.filteredTeams = this.filteredTeams.map(t => 
        t.id === this.selectedTeam?.id ? {...this.selectedTeam} : t
      );

      this.showSuccessToast('Team updated successfully!');
      this.closeModals();
    } catch (error) {
      this.showErrorToast('Failed to update team. Please try again.');
      console.error('Error updating team:', error);
    }
}
  confirmSaveTeamEdits(): void {
    if (this.selectedTeam) {
      const confirmed = confirm(`Are you sure you want to save changes to ${this.selectedTeam.name}?`);
      if (confirmed) {
        this.saveTeamEdits();
      }
    }
  }

  private showSuccessToast(message: string): void {
    // Implement your toast notification here or use a library
    alert(message); // Temporary solution - replace with proper toast
  }

  private showErrorToast(message: string): void {
    // Implement your toast notification here or use a library
    alert(message); // Temporary solution - replace with proper toast
  }


  /// In your component class
  addMemberToTeam(team: Team): void {
    this.selectedTeam = {...team};
    
    // Reset selections
    this.selectedMembers = [];
    this.memberSearchTerm = '';
    
    // Initialize available members
    this.filterAvailableMembers();
    
    this.showAddMemberModal = true;
  }

  filterAvailableMembers(): void {
    if (!this.selectedTeam) return;

    // Get current team members' IDs
    const teamMemberIds = this.getTeamMembers(this.selectedTeam.name).map(m => m.id);

    // Filter users not in the team
    let filtered = this.users.filter(user => !teamMemberIds.includes(user.id));

    // Apply search filter if there's a search term
    if (this.memberSearchTerm) {
      const term = this.memberSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }

    // Map to include selection state
    this.availableMembers = filtered.map(member => ({
      ...member,
      selected: this.selectedMembers.some(m => m.id === member.id)
    }));
  }

  toggleMemberSelection(member: User): void {
    member.selected = !member.selected;
    
    if (member.selected) {
      if (!this.selectedMembers.some(m => m.id === member.id)) {
        this.selectedMembers.push({...member});
      }
    } else {
      this.selectedMembers = this.selectedMembers.filter(m => m.id !== member.id);
    }
  }

  async addSelectedMembers(): Promise<void> {
    if (!this.selectedTeam || this.selectedMembers.length === 0) return;

    try {
      // Update team members
      const updatedTeam: Team = {
        ...this.selectedTeam,
        members: this.selectedTeam.members + this.selectedMembers.length,
        membersList: [
          ...(this.selectedTeam.membersList || []),
          ...this.selectedMembers.map(m => m.id)
        ]
      };

      // Update user team assignments
      for (const member of this.selectedMembers) {
        const user = this.users.find(u => u.id === member.id);
        if (user) {
          user.team = this.selectedTeam.name;
          await this.userService.updateUser(user);
        }
      }

      // Update team in service
      await this.teamService.updateTeam(updatedTeam);
      
      // Update local state
      const teamIndex = this.teams.findIndex(t => t.id === updatedTeam.id);
      if (teamIndex !== -1) {
        this.teams[teamIndex] = updatedTeam;
      }
      
      this.filteredTeams = this.teams; // Refresh filtered teams
      this.loadUsers(); // Refresh users
      
      this.showSuccessToast(`Added ${this.selectedMembers.length} members to team`);
      this.closeModals();
    } catch (error) {
      this.showErrorToast('Failed to add members. Please try again.');
      console.error('Error adding members:', error);
    }
  }

  onMemberSelectionChange(member: User): void {
    if (member.selected) {
      if (!this.selectedMembers.some(m => m.id === member.id)) {
        this.selectedMembers.push(member);
      }
    } else {
      this.selectedMembers = this.selectedMembers.filter(m => m.id !== member.id);
    }
  }

  // Add this method to handle team deletion
  deleteTeam(team: any): void {
    if (confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      this.teams = this.teams.filter((t: any) => t !== team);
      this.closeModals();
    }
  }

  getTeamMembers(teamName: string): User[] {
    return this.users.filter(user => user.team === teamName);
  }

  getAvailableMembers(): User[] {
    if (!this.selectedTeam) return [];
    
    return this.users.filter(user => 
      !this.getTeamMembers(this.selectedTeam!.name).some(member => member.id === user.id)
    );
  }

  getTeamProjects(teamName: string): any[] {
    // This should be replaced with actual project data
    return [
      {
        name: 'Project 1',
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 65,
        priority: 'high'
      },
      {
        name: 'Project 2',
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 30,
        priority: 'medium'
      }
    ];
  }

  getTeamHierarchy(team: Team): TeamHierarchy[] {
    const hierarchy: TeamHierarchy[] = [];
    
    // Add parent team
    hierarchy.push({
      id: team.id,
      name: team.name,
      level: 0,
      members: team.members,
      projects: team.projects
    });
    
    // Add sub-teams
    const subTeams = this.getSubTeams(team.id);
    subTeams.forEach(subTeam => {
      hierarchy.push({
        id: subTeam.id,
        name: subTeam.name,
        level: 1,
        members: subTeam.members,
        projects: subTeam.projects
      });
    });
    
    return hierarchy;
  }

  getUserByName(name: string): User | undefined {
    return this.users.find(user => user.name === name);
  }

  // Performance Tab methods
  loadPerformanceData(): void {
    // Load team leads
    this.teamLeads = this.users.filter(user => user.role === UserRole.LEAD).map(lead => ({
      ...lead,
      completionRate: Math.floor(Math.random() * 50) + 50,
      projects: {
        length: Math.floor(Math.random() * 5) + 1
      }
    }));
    
    // Load top performers
    this.topPerformers = [...this.users]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(user => ({
        ...user,
        completionRate: Math.floor(Math.random() * 50) + 50
      }));
  }

  // Helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('½');
    }
    
    return stars;
  }

  // Modal methods
  closeModals(): void {
    this.showUserDetailsModal = false;
    this.showEditUserModal = false;
    this.showAddUserModal = false;
    this.showAddTeamModal = false;
    this.showAddSubTeamModal = false;
    this.showTeamDetailsModal = false;
    this.showAddMemberModal = false;
    this.selectedMembers = [];
    this.selectedUser = {
      id: '',
      email: '',
      name: '',
      username: '',
      role: UserRole.USER,
      status: 'active'
    };
    this.selectedTeam = null;
  }
}