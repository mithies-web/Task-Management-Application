// sidebar.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User, Project } from '../../../model/user.model';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  skills: string[];
  projects: string[];
}
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  @Input() activePage: string = 'dashboard';
  @Input() isMobileSidebarOpen: boolean = false;
  @Input() currentUser: User | null = null;
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  activeMenu: string = 'dashboard';
  projects: Project[] = [];
  teamMembers: TeamMember[] = [];
  showAllProjects = false;
  showProjectDetails = false;
  selectedProject: Project | null = null;
  showTeamManagement = false;
  showCreateTask = false;
  newProject: Project = {
    id: '',
    name: '',
    description: '',
    status: 'in-progress',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    teamMembers: [],
    team: '',
    deadline: '',
    progress: 0,
    priority: 'medium'
  };
  newTask: any = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: '',
    projectId: '',
    storyPoints: 3
  };

  constructor(
    private router: Router,
    private modalService: NgbModal
  ) {
    this.loadProjects();
    this.loadTeamMembers();
  }

  loadProjects(): void {
    this.projects = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'in-progress',
        startDate: '2023-05-01',
        endDate: '2023-08-31',
        teamMembers: ['1', '2'],
        progress: 65,
        team: '',
        deadline: '',
        priority: 'medium'
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'New mobile application for iOS and Android',
        status: 'in-progress',
        startDate: '2023-04-15',
        endDate: '2023-09-30',
        teamMembers: ['2', '3'],
        progress: 35,
        team: '',
        deadline: '',
        priority: 'medium'
      },
      {
        id: '3',
        name: 'Marketing Campaign',
        description: 'Q3 marketing initiatives',
        status: 'not-started',
        startDate: '2023-07-01',
        endDate: '2023-09-30',
        teamMembers: ['1'],
        progress: 0,
        team: '',
        deadline: '',
        priority: 'medium'
      },
      {
        id: '4',
        name: 'API Optimization',
        description: 'Improve backend API performance',
        status: 'in-progress',
        startDate: '2023-05-10',
        endDate: '2023-07-15',
        teamMembers: ['3'],
        progress: 20,
        team: '',
        deadline: '',
        priority: 'medium'
      }
    ];
  }

  loadTeamMembers(): void {
    this.teamMembers = [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Designer',
        email: 'sarah@example.com',
        skills: ['UI/UX', 'Figma', 'Photoshop'],
        projects: ['1', '3']
      },
      {
        id: '2',
        name: 'Mike Smith',
        role: 'Developer',
        email: 'mike@example.com',
        skills: ['Angular', 'Node.js', 'TypeScript'],
        projects: ['1', '2']
      },
      {
        id: '3',
        name: 'Alex Chen',
        role: 'Developer',
        email: 'alex@example.com',
        skills: ['Java', 'Spring Boot', 'SQL'],
        projects: ['2', '4']
      }
    ];
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
  }

  toggleCreateTask(): void {
    this.showCreateTask = !this.showCreateTask;
    this.showProjectDetails = false;
    this.showAllProjects = false;
    this.showTeamManagement = false;
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      assignee: '',
      projectId: this.selectedProject?.id || '',
      storyPoints: 3
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getProjectMembers(projectId: string): TeamMember[] {
    return this.teamMembers
      .filter(member => member.projects.includes(projectId))
      .map(member => ({
        ...member,
        role: member.role || 'Team Member'
      }));
  }

  createProject(): void {
    const newProject: Project = {
      ...this.newProject,
      id: 'proj-' + (this.projects.length + 1),
      teamMembers: [],
      progress: 0
    };
    this.projects.push(newProject);
    this.newProject = {
      id: '',
      name: '',
      description: '',
      status: 'in-progress',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      teamMembers: [],
      team: '',
      deadline: '',
      progress: 0,
      priority: 'medium'
    };
  }

  createTask(): void {
    // In a real app, you'd save this to your backend
    console.log('Task created:', this.newTask);
    this.showCreateTask = false;
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      assignee: '',
      projectId: this.selectedProject?.id || '',
      storyPoints: 3
    };
  }

  addTeamMemberToProject(memberId: string): void {
    if (this.selectedProject && !this.selectedProject.teamMembers?.includes(memberId)) {
      this.selectedProject.teamMembers?.push(memberId);
    }
  }

  removeTeamMemberFromProject(memberId: string): void {
    if (this.selectedProject) {
      this.selectedProject.teamMembers = (this.selectedProject.teamMembers ?? []).filter(id => id !== memberId);
    }
  }

  getTeamMember(id: string): TeamMember | undefined {
    return this.teamMembers?.find(member => member.id === id);
  }
}