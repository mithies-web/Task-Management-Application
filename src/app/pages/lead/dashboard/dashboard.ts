// dashboard.ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../../model/user.model';
import { Chart, registerables } from 'chart.js';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { UserService } from '../../../core/services/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lead-dashboard',
  imports: [
    CommonModule,
    FormsModule
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
  projects: any[] = [];
  upcomingTasks: Task[] = [];
  performanceChart: any;
  messageModalOpen = false;
  reportModalOpen = false;
  reportType = 'project';
  selectedReportProject = '';
  selectedReportMember = '';
  message = {
    to: '',
    subject: '',
    body: ''
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private modalService: NgbModal
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadTeamMembers();
    this.loadProjects();
    this.loadUpcomingTasks();
    this.initPerformanceChart();
  }

  loadStats(): void {
    this.stats = {
      tasksCompleted: 42,
      inProgress: 15,
      pendingReview: 8,
      overdue: 3
    };
  }

  loadTeamMembers(): void {
    this.teamMembers = [
      {
        id: '1',
        name: 'Vetri R',
        role: 'Designer',
        completed: 8,
        inProgress: 3,
        productivity: 85,
        profileImg: 'assets/profile1.jpg',
        email: 'vetri@example.com'
      },
      {
        id: '2',
        name: 'Kruthika S',
        role: 'Developer',
        completed: 12,
        inProgress: 4,
        productivity: 92,
        profileImg: 'assets/profile2.jpg',
        email: 'kruthika@example.com'
      },
      {
        id: '3',
        name: 'Alex Raj P',
        role: 'Developer',
        completed: 6,
        inProgress: 5,
        productivity: 65,
        profileImg: 'assets/profile3.jpg',
        email: 'alex@example.com'
      }
    ];
  }

  loadProjects(): void {
    this.projects = this.projectService.getProjects();
  }

  loadUpcomingTasks(): void {
    this.upcomingTasks = [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Assigned to Sarah Johnson',
        dueDate: new Date('2023-05-15'),
        status: 'in-progress',
        priority: 'high',
        assignee: 'Vetri R',
        projectId: 'proj-1',
        tags: ['design', 'homepage']
      },
      {
        id: '2',
        title: 'Implement user authentication',
        description: 'Assigned to Mike Smith',
        dueDate: new Date('2023-05-18'),
        status: 'todo',
        priority: 'high',
        assignee: 'Kruthika S',
        projectId: 'proj-2',
        tags: ['backend', 'auth']
      },
      {
        id: '3',
        title: 'Write API documentation',
        description: 'Assigned to Alex Chen',
        dueDate: new Date('2023-05-10'),
        status: 'review',
        priority: 'medium',
        assignee: 'Alex Raj P',
        projectId: 'proj-3',
        tags: ['documentation', 'api']
      }
    ];
  }

  initPerformanceChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Task Completion',
            data: [65, 59, 80, 81, 56, 72],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'On Time Delivery',
            data: [28, 48, 40, 19, 86, 27],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  openMessageModal(member: any): void {
    this.message = {
      to: member.email,
      subject: '',
      body: ''
    };
    this.messageModalOpen = true;
  }

  sendMessage(): void {
    // In a real app, you'd send this to your backend
    console.log('Message sent:', this.message);
    this.messageModalOpen = false;
    this.message = { to: '', subject: '', body: '' };
  }

  openReportModal(): void {
    this.reportModalOpen = true;
  }

  generateReport(): void {
    // Generate report based on selected filters
    console.log('Generating report:', {
      type: this.reportType,
      project: this.selectedReportProject,
      member: this.selectedReportMember
    });
    // In a real app, this would fetch data and display/download report
  }
}