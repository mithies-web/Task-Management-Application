import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { faUsers, faProjectDiagram, faChartLine, faSearch, faFilter, faPlus, faEye, faEdit, faTrashAlt, faTimes, faPhoneAlt, faInfoCircle, faUserFriends, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Team, TeamHierarchy, User, UserRole } from '../../../model/user.model';
import { UserService } from '../../../core/services/user/user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TeamService } from '../../../core/services/team/team';
Chart.register(...registerables);

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
  @ViewChild('teamCompletionChart', { static: true }) teamCompletionChartRef!: ElementRef;
  @ViewChild('taskTimelineChart', { static: true }) taskTimelineChartRef!: ElementRef;
  private teamCompletionChart?: Chart;
  private taskTimelineChart?: Chart;

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
    status: 'active',
    gender: '',
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

  // Form validation
  userFormErrors: any = {};
  teamFormErrors: any = {};
  isSubmitting = false;

  constructor(
    private userService: UserService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadPerformanceData();
  }

  switchTab(tab: 'users' | 'teams' | 'performance'): void {
    this.activeTab = tab;
    if (tab === 'teams') {
      this.loadTeams();
    } else if (tab === 'performance') {
      this.loadPerformanceData();
    }
  }

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

  viewUserDetails(user: User): void {
    this.selectedUser = { ...user };
    this.showUserDetailsModal = true;
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.userFormErrors = {};
    this.showEditUserModal = true;
  }

  async saveUser(): Promise<void> {
    this.userFormErrors = {};
    this.isSubmitting = true;

    if (!this.selectedUser.name) {
      this.userFormErrors.name = 'Name is required';
    }
    if (!this.selectedUser.email) {
      this.userFormErrors.email = 'Email is required';
    } else if (!this.validateEmail(this.selectedUser.email)) {
      this.userFormErrors.email = 'Invalid email format';
    }
    if (!this.selectedUser.username) {
      this.userFormErrors.username = 'Username is required';
    }
    if (!this.selectedUser.role) {
      this.userFormErrors.role = 'Role is required';
    }
    if (!this.selectedUser.status) {
      this.userFormErrors.status = 'Status is required';
    }

    if (Object.keys(this.userFormErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    try {
      await this.userService.updateUser(this.selectedUser);
      this.loadUsers();
      this.closeModals();
      this.showSuccessToast('User updated successfully!');
    } catch (error) {
      this.showErrorToast('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user.id);
      this.loadUsers();
      this.closeModals();
    }
  }

  openAddUserModal(): void {
    this.newUser = {
      role: UserRole.USER,
      status: 'active',
      employeeType: 'full-time',
      location: 'remote'
    };
    this.userFormErrors = {};
    this.showAddUserModal = true;
  }

  async createUser(): Promise<void> {
    this.userFormErrors = {};
    this.isSubmitting = true;

    if (!this.newUser.name) {
      this.userFormErrors.name = 'Name is required';
    }
    if (!this.newUser.email) {
      this.userFormErrors.email = 'Email is required';
    } else if (!this.validateEmail(this.newUser.email)) {
      this.userFormErrors.email = 'Invalid email format';
    }
    if (!this.newUser.username) {
      this.userFormErrors.username = 'Username is required';
    }
    if (!this.newUser.password) {
      this.userFormErrors.password = 'Password is required';
    }
    if (!this.newUser.role) {
      this.userFormErrors.role = 'Role is required';
    }
    if (!this.newUser.status) {
      this.userFormErrors.status = 'Status is required';
    }

    if (Object.keys(this.userFormErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    try {
      const newUser: User = {
        id: (this.users.length + 1).toString(),
        name: this.newUser.name!,
        email: this.newUser.email!,
        username: this.newUser.username || this.newUser.email!.split('@')[0],
        password: this.newUser.password!,
        role: this.newUser.role as UserRole,
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
      
      await this.userService.addUser(newUser);
      this.loadUsers();
      this.closeModals();
      this.showSuccessToast('User created successfully!');
    } catch (error) {
      this.showErrorToast('Failed to create user. Please try again.');
      console.error('Error creating user:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  loadTeams(): void {
    this.teams = this.teamService.getTeams();
    this.filteredTeams = [...this.teams];
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
    this.teamFormErrors = {};
    this.showAddTeamModal = true;
  }

  openAddSubTeamModal(): void {
    this.newSubTeam = {
      members: 0,
      projects: 0,
      completionRate: 0
    };
    this.teamFormErrors = {};
    this.showAddSubTeamModal = true;
  }

  addSubTeam(team: Team): void {
    this.newSubTeam = {
      parentTeam: team.name,
      members: 0,
      projects: 0,
      completionRate: 0
    };
    this.teamFormErrors = {};
    this.showAddSubTeamModal = true;
  }

  async createTeam(): Promise<void> {
    this.teamFormErrors = {};
    this.isSubmitting = true;

    if (!this.newTeam.name) {
      this.teamFormErrors.name = 'Team name is required';
    }
    if (!this.newTeam.department) {
      this.teamFormErrors.department = 'Department is required';
    }

    if (Object.keys(this.teamFormErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    try {
      const newTeam: Team = {
        id: (this.teams.length + 1).toString(),
        name: this.newTeam.name!,
        department: this.newTeam.department!,
        lead: this.newTeam.lead,
        members: this.newTeam.members || 0,
        projects: this.newTeam.projects || 0,
        completionRate: this.newTeam.completionRate || 0,
        description: this.newTeam.description,
        parentTeam: this.newTeam.parentTeam || null
      };
      
      await this.teamService.addTeam(newTeam);
      this.loadTeams();
      this.closeModals();
      this.showSuccessToast('Team created successfully!');
    } catch (error) {
      this.showErrorToast('Failed to create team. Please try again.');
      console.error('Error creating team:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async createSubTeam(): Promise<void> {
    this.teamFormErrors = {};
    this.isSubmitting = true;

    if (!this.newSubTeam.name) {
      this.teamFormErrors.name = 'Sub-team name is required';
    }
    if (!this.newSubTeam.parentTeam) {
      this.teamFormErrors.parentTeam = 'Parent team is required';
    }

    if (Object.keys(this.teamFormErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    try {
      const newSubTeam: Team = {
        id: (this.teams.length + 1).toString(),
        name: this.newSubTeam.name!,
        department: this.teams.find(t => t.name === this.newSubTeam.parentTeam)?.department || '',
        lead: this.newSubTeam.lead,
        members: this.newSubTeam.members || 0,
        projects: this.newSubTeam.projects || 0,
        completionRate: this.newSubTeam.completionRate || 0,
        description: this.newSubTeam.description,
        parentTeam: this.newSubTeam.parentTeam
      };
      
      await this.teamService.addTeam(newSubTeam);
      this.loadTeams();
      this.closeModals();
      this.showSuccessToast('Sub-team created successfully!');
    } catch (error) {
      this.showErrorToast('Failed to create sub-team. Please try again.');
      console.error('Error creating sub-team:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  viewTeamDetails(team: Team): void {
    this.selectedTeam = { ...team };
    this.showTeamDetailsModal = true;
  }

  editTeam(team: Team): void {
    this.selectedTeam = JSON.parse(JSON.stringify(team));
    this.teamFormErrors = {};
    this.showEditTeamModal = true;
  }

  async saveTeamEdits(): Promise<void> {
    if (!this.selectedTeam) return;

    this.teamFormErrors = {};
    this.isSubmitting = true;

    if (!this.selectedTeam.name) {
      this.teamFormErrors.name = 'Team name is required';
    }
    if (!this.selectedTeam.department) {
      this.teamFormErrors.department = 'Department is required';
    }

    if (Object.keys(this.teamFormErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    try {
      await this.teamService.updateTeam(this.selectedTeam);
      
      const index = this.teams.findIndex(t => t.id === this.selectedTeam?.id);
      if (index !== -1) {
        this.teams[index] = {...this.selectedTeam};
      }
      
      this.filteredTeams = this.filteredTeams.map(t => 
        t.id === this.selectedTeam?.id ? {...this.selectedTeam} : t
      );

      this.showSuccessToast('Team updated successfully!');
      this.closeModals();
    } catch (error) {
      this.showErrorToast('Failed to update team. Please try again.');
      console.error('Error updating team:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
      this.teamService.deleteTeam(team.id);
      this.loadTeams();
      this.closeModals();
    }
  }

  addMemberToTeam(team: Team): void {
    this.selectedTeam = {...team};
    this.selectedMembers = [];
    this.memberSearchTerm = '';
    this.filterAvailableMembers();
    this.showAddMemberModal = true;
  }

  filterAvailableMembers(): void {
    if (!this.selectedTeam) return;

    const teamMemberIds = this.getTeamMembers(this.selectedTeam.name).map(m => m.id);
    let filtered = this.users.filter(user => !teamMemberIds.includes(user.id));

    if (this.memberSearchTerm) {
      const term = this.memberSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }

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

    this.isAddingMembers = true;

    try {
      const updatedTeam: Team = {
        ...this.selectedTeam,
        members: this.selectedTeam.members + this.selectedMembers.length,
        membersList: [
          ...(this.selectedTeam.membersList || []),
          ...this.selectedMembers.map(m => m.id)
        ]
      };

      for (const member of this.selectedMembers) {
        const user = this.users.find(u => u.id === member.id);
        if (user) {
          user.team = this.selectedTeam.name;
          await this.userService.updateUser(user);
        }
      }

      await this.teamService.updateTeam(updatedTeam);
      
      const teamIndex = this.teams.findIndex(t => t.id === updatedTeam.id);
      if (teamIndex !== -1) {
        this.teams[teamIndex] = updatedTeam;
      }
      
      this.filteredTeams = this.teams;
      this.loadUsers();
      
      this.showSuccessToast(`Added ${this.selectedMembers.length} members to team`);
      this.closeModals();
    } catch (error) {
      this.showErrorToast('Failed to add members. Please try again.');
      console.error('Error adding members:', error);
    } finally {
      this.isAddingMembers = false;
    }
  }

  getTeamMembers(teamName: string): User[] {
    return this.users.filter(user => user.team === teamName);
  }

  getTeamProjects(teamName: string): any[] {
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
    
    hierarchy.push({
      id: team.id,
      name: team.name,
      level: 0,
      members: team.members,
      projects: team.projects
    });
    
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

  loadPerformanceData(): void {
    this.teamLeads = this.users.filter(user => user.role === UserRole.LEAD).map(lead => ({
      ...lead,
      completionRate: Math.floor(Math.random() * 50) + 50,
      projects: {
        length: Math.floor(Math.random() * 5) + 1
      }
    }));
    
    this.topPerformers = [...this.users]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(user => ({
        ...user,
        completionRate: Math.floor(Math.random() * 50) + 50
      }));
  }

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

  closeModals(): void {
    this.showUserDetailsModal = false;
    this.showEditUserModal = false;
    this.showAddUserModal = false;
    this.showAddTeamModal = false;
    this.showAddSubTeamModal = false;
    this.showTeamDetailsModal = false;
    this.showEditTeamModal = false;
    this.showAddMemberModal = false;
    this.selectedMembers = [];
    this.userFormErrors = {};
    this.teamFormErrors = {};
    this.isSubmitting = false;
    this.isAddingMembers = false;
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

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private showSuccessToast(message: string): void {
    // Replace with your toast implementation
    alert(message);
  }

  private showErrorToast(message: string): void {
    // Replace with your toast implementation
    alert(message);
  }

  private initCharts(): void {
    this.initTeamCompletionChart();
    this.initTaskTimelineChart();
  }

  private initTeamCompletionChart(): void {
    const ctx = this.teamCompletionChartRef.nativeElement.getContext('2d');
    
    if (this.teamCompletionChart) {
      this.teamCompletionChart.destroy();
    }

    this.teamCompletionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.teams.slice(0, 5).map(team => team.name),
        datasets: [{
          label: 'Completion Rate %',
          data: this.teams.slice(0, 5).map(team => team.completionRate),
          backgroundColor: [
            'rgba(79, 70, 229, 0.7)',
            'rgba(99, 102, 241, 0.7)',
            'rgba(129, 140, 248, 0.7)',
            'rgba(165, 180, 252, 0.7)',
            'rgba(199, 210, 254, 0.7)'
          ],
          borderColor: [
            'rgba(79, 70, 229, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(129, 140, 248, 1)',
            'rgba(165, 180, 252, 1)',
            'rgba(199, 210, 254, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.parsed.y + '%';
              }
            }
          }
        }
      }
    });
  }

  private initTaskTimelineChart(): void {
    const ctx = this.taskTimelineChartRef.nativeElement.getContext('2d');
    
    if (this.taskTimelineChart) {
      this.taskTimelineChart.destroy();
    }

    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    const completedTasks = [10, 25, 35, 50, 65, 80];
    const totalTasks = [20, 40, 60, 80, 100, 120];

    this.taskTimelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [
          {
            label: 'Completed Tasks',
            data: completedTasks,
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Total Tasks',
            data: totalTasks,
            borderColor: 'rgba(156, 163, 175, 1)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            borderDash: [5, 5],
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.teamCompletionChart) {
      this.teamCompletionChart.destroy();
    }
    if (this.taskTimelineChart) {
      this.taskTimelineChart.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }
}