// sidebar.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User, Project } from '../../../model/user.model';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { LocalStorageService } from '../../../core/services/local-storage/local-storage';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  skills: string[];
  projects: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  logo: string = 'public/logo/logo-black.png';
  @Input() activePage: string = 'dashboard';
  @Input() isMobileSidebarOpen: boolean = false;
  @Input() currentUser: User | null = null;
  @Input() collapsed: boolean = false;

  activeMenu: string = 'dashboard';
  projects: Project[] = [];
  teamMembers: TeamMember[] = [];
  availableMembers: TeamMember[] = [];
  showAllProjects = false;
  showProjectDetails = false;
  selectedProject: Project | null = null;
  showTeamManagement = false;
  showCreateTask = false;
  
  selectedMemberToAdd: string = '';
  
  newTask: any = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: '',
    projectId: '',
    storyPoints: 3,
    status: 'todo',
    estimatedHours: 8,
    attachments: ''
  };

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private userService: UserService,
    private localStorage: LocalStorageService
  ) {
    this.loadProjects();
    this.loadTeamMembers();
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTeamMembers();
  }

  loadProjects(): void {
    const allProjects = this.projectService.getProjects();
    this.projects = allProjects.filter(project => 
      project.lead === this.currentUser?.name || 
      project.teamMembers?.includes(this.currentUser?.id || '')
    );
  }

  loadTeamMembers(): void {
    // Get team members from local storage
    const storedMembers = this.localStorage.get<TeamMember[]>('teamMembers') || [];
    this.teamMembers = storedMembers;
    
    // Get all users and filter out those who are already team members
    const allUsers = this.userService.getUsers();
    this.availableMembers = allUsers
      .filter(user => !this.teamMembers.some(member => member.id === user.id))
      .map(user => ({
        id: user.id,
        name: user.name,
        role: user.role || 'Team Member',
        email: user.email,
        skills: [],
        projects: []
      }));
  }

  navigateTo(route: string): void {
    this.activeMenu = route;
    this.router.navigate([`/lead/${route}`]);
    this.resetViews();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  toggleAllProjects(): void {
    this.showAllProjects = !this.showAllProjects;
    this.resetViews();
  }

  viewProjectDetails(project: Project): void {
    this.selectedProject = project;
    this.showProjectDetails = true;
    this.showAllProjects = false;
    this.showTeamManagement = false;
    this.showCreateTask = false;
  }

  toggleTeamManagement(): void {
    this.showTeamManagement = !this.showTeamManagement;
    this.showProjectDetails = false;
    this.showAllProjects = false;
    this.showCreateTask = false;
    this.loadTeamMembers(); // Refresh available members
  }

  toggleCreateTask(): void {
    this.showCreateTask = !this.showCreateTask;
    this.showProjectDetails = false;
    this.showAllProjects = false;
    this.showTeamManagement = false;
    this.resetNewTaskForm();
  }

  resetNewTaskForm(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      assignee: '',
      projectId: this.selectedProject?.id || '',
      storyPoints: 3,
      status: 'todo',
      estimatedHours: 8,
      attachments: ''
    };
  }

  resetViews(): void {
    this.showProjectDetails = false;
    this.showTeamManagement = false;
    this.showCreateTask = false;
    this.selectedProject = null;
  }

  getProjectStatusColor(status: string): string {
    switch (status) {
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  createTask(): void {
    // In a real app, you'd save this to your backend
    console.log('Task created:', this.newTask);
    this.showCreateTask = false;
    this.resetNewTaskForm();
  }

  addTeamMember(): void {
    if (!this.selectedMemberToAdd) return;
    
    const memberToAdd = this.availableMembers.find(member => member.id === this.selectedMemberToAdd);
    if (!memberToAdd) return;
    
    this.teamMembers.push(memberToAdd);
    this.localStorage.set('teamMembers', this.teamMembers);
    this.selectedMemberToAdd = '';
    this.loadTeamMembers(); // Refresh the list
    
    console.log('New team member added:', memberToAdd);
  }

  removeTeamMember(memberId: string): void {
    this.teamMembers = this.teamMembers.filter(member => member.id !== memberId);
    this.localStorage.set('teamMembers', this.teamMembers);
    this.loadTeamMembers(); // Refresh the list
    
    console.log('Team member removed:', memberId);
  }

  getTeamMember(id: string): TeamMember | undefined {
    return this.teamMembers.find(member => member.id === id);
  }
}