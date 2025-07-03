import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  filters: {
    dateRange: string;
    teams: string;
    status: string;
  };
  summary: {
    totalProjects?: number;
    completed?: number;
    avgCompletionTime?: string;
    totalHours?: number;
    avgPerMember?: string;
    overtimeHours?: number;
  };
  data: any[];
  notes: string[];
}

interface ReportForm {
  reportType: string;
  dateRange: string;
  filter: string;
  columns: {
    project: boolean;
    team: boolean;
    status: boolean;
    dates: boolean;
    hours: boolean;
  };
  format: 'table' | 'chart' | 'both';
}

@Component({
  selector: 'app-report-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-management.html',
  styleUrls: ['./report-management.css']
})
export class ReportManagement implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reportPieChart') reportPieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reportBarChart') reportBarChartRef!: ElementRef<HTMLCanvasElement>;

  private isBrowser: boolean;
  private reportPieChart: Chart | null = null;
  private reportBarChart: Chart | null = null;

  activeTab = 'saved';
  showReportGenerator = false;
  showAdvancedOptions = false;
  showExportDropdown = false;
  selectedReport: Report | null = null;
  searchTerm = '';
  filteredReports: Report[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  paginationInfo = { start: 1, end: 6, total: 0 };

  tabs = [
    { id: 'saved', label: 'Saved Reports', icon: 'fa-file-alt' },
    { id: 'history', label: 'Report History', icon: 'fa-history' },
    { id: 'custom', label: 'Custom Reports', icon: 'fa-chart-pie' }
  ];

  reportForm: ReportForm = {
    reportType: '',
    dateRange: '30',
    filter: 'all',
    columns: {
      project: true,
      team: true,
      status: true,
      dates: false,
      hours: false
    },
    format: 'table'
  };

  reports: Report[] = [
    {
      id: 1,
      title: "Q2 Project Progress",
      type: "Project Progress",
      date: "15 Jun 2023",
      description: "Progress report for all projects in Q2 with completion metrics and team performance.",
      status: "completed",
      filters: {
        dateRange: "1 Apr - 30 Jun 2023",
        teams: "All Teams",
        status: "All Statuses"
      },
      summary: {
        totalProjects: 18,
        completed: 12,
        avgCompletionTime: "14 days"
      },
      data: [
        {
          projectName: "Website Redesign",
          team: "Design",
          startDate: "01 Apr 2023",
          dueDate: "15 May 2023",
          status: "Completed",
          progress: 100
        },
        {
          projectName: "Mobile App Development",
          team: "Development",
          startDate: "10 Apr 2023",
          dueDate: "30 Jun 2023",
          status: "In Progress",
          progress: 75
        },
        {
          projectName: "Marketing Campaign",
          team: "Marketing",
          startDate: "15 May 2023",
          dueDate: "30 Jun 2023",
          status: "Pending",
          progress: 20
        }
      ],
      notes: [
        "Design team completed all projects ahead of schedule",
        "Development team has 2 projects at risk of missing deadlines",
        "Overall completion rate improved by 15% compared to Q1"
      ]
    },
    {
      id: 2,
      title: "Development Team Analysis",
      type: "Team Performance",
      date: "1 Jun 2023",
      description: "Detailed analysis of development team performance with task completion rates.",
      status: "in-progress",
      filters: {
        dateRange: "1 May - 31 May 2023",
        teams: "Development Team",
        status: "Active Projects"
      },
      summary: {
        totalProjects: 8,
        completed: 3,
        avgCompletionTime: "18 days"
      },
      data: [
        {
          projectName: "API Integration",
          team: "Development",
          startDate: "01 May 2023",
          dueDate: "20 Jun 2023",
          status: "In Progress",
          progress: 60
        },
        {
          projectName: "Backend Optimization",
          team: "Development",
          startDate: "10 May 2023",
          dueDate: "25 Jun 2023",
          status: "In Progress",
          progress: 45
        }
      ],
      notes: [
        "Development team is working on 5 active projects",
        "Two projects are behind schedule by 1-2 weeks"
      ]
    }
  ];

  reportHistory = [
    { name: "Q2 Performance Review", type: "Team Performance", generatedBy: "Admin User", date: "15 Jun 2023" },
    { name: "May Time Tracking", type: "Time Tracking", generatedBy: "Admin User", date: "31 May 2023" }
  ];

  customTemplates = [
    {
      name: "Monthly Project Status",
      lastUsed: "31 May 2023",
      description: "Standard monthly project status report with completion metrics.",
      badge: "Favorite",
      badgeClass: "bg-blue-100 text-blue-800",
      badgeIcon: "fa-star"
    },
    {
      name: "Team Performance",
      lastUsed: "15 Jun 2023",
      description: "Detailed team performance metrics with comparison charts.",
      badge: "Recently Used",
      badgeClass: "bg-gray-100 text-gray-800",
      badgeIcon: "fa-clock"
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      Chart.register(...registerables);
    }
  }

  ngOnInit() {
    this.filteredReports = [...this.reports];
    this.updatePagination();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.reportPieChart) {
      this.reportPieChart.destroy();
    }
    if (this.reportBarChart) {
      this.reportBarChart.destroy();
    }
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    this.selectedReport = null;
  }

  toggleReportGenerator() {
    this.showReportGenerator = !this.showReportGenerator;
  }

  toggleAdvancedOptions() {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  toggleExportDropdown() {
    this.showExportDropdown = !this.showExportDropdown;
  }

  generateReport() {
    if (!this.reportForm.reportType) {
      if (this.isBrowser) {
        alert('Please select a report type');
      }
      return;
    }

    const newReport: Report = {
      id: this.reports.length + 1,
      title: `New ${this.getReportTypeLabel(this.reportForm.reportType)}`,
      type: this.getReportTypeLabel(this.reportForm.reportType),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      description: `Automatically generated ${this.getReportTypeLabel(this.reportForm.reportType)}`,
      status: "completed",
      filters: {
        dateRange: this.getDateRangeLabel(this.reportForm.dateRange),
        teams: this.getFilterLabel(this.reportForm.filter),
        status: "All Statuses"
      },
      summary: this.reports[0].summary,
      data: this.reports[0].data,
      notes: ["This is an automatically generated report"]
    };

    this.reports.unshift(newReport);
    this.filteredReports = [...this.reports];
    this.updatePagination();
    this.showReportGenerator = false;
    this.viewReport(newReport.id);

    if (this.isBrowser) {
      alert('Report generated successfully!');
    }
  }

  cancelReportGeneration() {
    this.showReportGenerator = false;
    this.resetReportForm();
  }

  filterReports() {
    if (!this.searchTerm.trim()) {
      this.filteredReports = [...this.reports];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredReports = this.reports.filter(report => 
        report.title.toLowerCase().includes(term) || 
        report.description.toLowerCase().includes(term) ||
        report.type.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  viewReport(reportId: number) {
    this.selectedReport = this.reports.find(r => r.id === reportId) || null;
    if (this.selectedReport && this.isBrowser) {
      setTimeout(() => {
        this.initializeCharts();
      }, 100);
    }
  }

  closeReportView() {
    this.selectedReport = null;
  }

  exportReport(reportId: number) {
    const report = this.reports.find(r => r.id === reportId);
    if (report && this.isBrowser) {
      console.log('Exporting report:', report.title);
      alert(`Exporting ${report.title} as PDF...`);
    }
  }

  exportAs(format: string) {
    if (this.selectedReport && this.isBrowser) {
      console.log(`Exporting ${this.selectedReport.title} as ${format.toUpperCase()}`);
      alert(`Exporting ${this.selectedReport.title} as ${format.toUpperCase()}...`);
    }
    this.showExportDropdown = false;
  }

  printReport() {
    if (this.isBrowser) {
      window.print();
    }
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredReports.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredReports.length);
    this.paginationInfo = {
      start,
      end,
      total: this.filteredReports.length
    };
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fa-check-circle';
      case 'in-progress': return 'fa-sync-alt';
      case 'pending': return 'fa-clock';
      default: return 'fa-clock';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  }

  getFilterTags(report: Report): string[] {
    return [
      `Date Range: ${report.filters.dateRange}`,
      `Teams: ${report.filters.teams}`,
      `Status: ${report.filters.status}`
    ];
  }

  getSummaryCards(report: Report): any[] {
    if (report.type.includes('Project') || report.type.includes('Team')) {
      return [
        {
          label: 'Total Projects',
          value: report.summary.totalProjects?.toString() || '0',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          valueColor: 'text-blue-900'
        },
        {
          label: 'Completed',
          value: `${report.summary.completed} (${Math.round(((report.summary.completed || 0) / (report.summary.totalProjects || 1)) * 100)}%)`,
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          valueColor: 'text-green-900'
        },
        {
          label: 'Avg. Completion Time',
          value: report.summary.avgCompletionTime || '0 days',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          valueColor: 'text-purple-900'
        }
      ];
    } else if (report.type.includes('Time')) {
      return [
        {
          label: 'Total Hours',
          value: report.summary.totalHours?.toString() || '0',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          valueColor: 'text-blue-900'
        },
        {
          label: 'Avg. Per Member',
          value: report.summary.avgPerMember || '0 hours',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          valueColor: 'text-green-900'
        },
        {
          label: 'Overtime Hours',
          value: report.summary.overtimeHours?.toString() || '0',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
          valueColor: 'text-purple-900'
        }
      ];
    }
    return [];
  }

  getTableHeaders(report: Report): string[] {
    if (report.data && report.data.length > 0) {
      return Object.keys(report.data[0]).filter(key => key !== 'id').map(key => 
        key.split(/(?=[A-Z])/).join(' ')
      );
    }
    return [];
  }

  getTableRow(row: any): string[] {
    return Object.keys(row).filter(key => key !== 'id').map(key => {
      const value = row[key];
      
      if (key === 'status') {
        let statusClass = '';
        if (value === 'Completed') statusClass = 'bg-green-100 text-green-800';
        else if (value === 'In Progress') statusClass = 'bg-blue-100 text-blue-800';
        else if (value === 'Pending') statusClass = 'bg-yellow-100 text-yellow-800';
        else statusClass = 'bg-gray-100 text-gray-800';
        
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">${value}</span>`;
      } else if (key === 'progress') {
        let progressColor = '';
        if (value >= 80) progressColor = 'bg-green-600';
        else if (value >= 50) progressColor = 'bg-blue-600';
        else progressColor = 'bg-yellow-400';
        
        return `
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="${progressColor} h-2 rounded-full" style="width: ${value}%"></div>
          </div>
        `;
      } else {
        return value?.toString() || '';
      }
    });
  }

  private getReportTypeLabel(type: string): string {
    switch (type) {
      case 'project_progress': return 'Project Progress Report';
      case 'task_completion': return 'Task Completion Report';
      case 'team_performance': return 'Team Performance Report';
      case 'time_tracking': return 'Time Tracking Report';
      case 'custom': return 'Custom Report';
      default: return 'Report';
    }
  }

  private getDateRangeLabel(range: string): string {
    switch (range) {
      case '7': return 'Last 7 Days';
      case '30': return 'Last 30 Days';
      case '90': return 'Last Quarter';
      case '365': return 'This Year';
      case 'custom': return 'Custom Range';
      default: return 'Unknown Range';
    }
  }

  private getFilterLabel(filter: string): string {
    switch (filter) {
      case 'all': return 'All Teams & Projects';
      case 'development': return 'Development Team';
      case 'design': return 'Design Team';
      case 'marketing': return 'Marketing Team';
      case 'specific': return 'Specific Project';
      default: return 'Unknown Filter';
    }
  }

  private resetReportForm() {
    this.reportForm = {
      reportType: '',
      dateRange: '30',
      filter: 'all',
      columns: {
        project: true,
        team: true,
        status: true,
        dates: false,
        hours: false
      },
      format: 'table'
    };
    this.showAdvancedOptions = false;
  }

  private initializeCharts() {
    if (this.selectedReport) {
      this.createReportPieChart();
      this.createReportBarChart();
    }
  }

  private createReportPieChart() {
    if (!this.reportPieChartRef?.nativeElement || !this.selectedReport) return;

    const ctx = this.reportPieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.reportPieChart) {
      this.reportPieChart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [
            this.selectedReport.data.filter(p => p.status === 'Completed').length,
            this.selectedReport.data.filter(p => p.status === 'In Progress').length,
            this.selectedReport.data.filter(p => p.status === 'Pending').length
          ],
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }
    };

    this.reportPieChart = new Chart(ctx, config);
  }

  private createReportBarChart() {
    if (!this.reportBarChartRef?.nativeElement || !this.selectedReport) return;

    const ctx = this.reportBarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.reportBarChart) {
      this.reportBarChart.destroy();
    }

    // Group by team for the bar chart
    const teams = [...new Set(this.selectedReport.data.map(item => item.team))];
    const teamData = teams.map(team => {
      const teamProjects = this.selectedReport!.data.filter(p => p.team === team);
      const avgProgress = teamProjects.reduce((sum, project) => sum + (project.progress || 0), 0) / teamProjects.length;
      return Math.round(avgProgress);
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: teams,
        datasets: [{
          label: 'Completion %',
          data: teamData,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
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
        }
      }
    };

    this.reportBarChart = new Chart(ctx, config);
  }
}