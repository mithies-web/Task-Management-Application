import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project/project';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { faTemperatureDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './lead-sidebar.html',
  styleUrls: ['./lead-sidebar.css']
})
export class LeadSidebar {
  @Input() sidebarOpen = true;
  showCreateProjectModal = false;
  projectForm: FormGroup;
  projects: any[] =[
    { name: 'Website Redesign', colorClass: 'bg-green-400' },
    { name: 'Mobile App Development', colorClass: 'bg-yellow-400' }
  ];
  teams = ['Design Team', 'Development Team', 'Marketing Team'];
  priorities = ['Low', 'Medium', 'High', 'Critical'];

  constructor(private fb: FormBuilder, private projectService: ProjectService) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      team: ['', Validators.required],
      priority: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  openCreateProjectModal(event: Event) {
    event.preventDefault();
    this.showCreateProjectModal = true;
  }

  closeCreateProjectModal() {
    this.showCreateProjectModal = false;
    this.projectForm.reset();
  }

  createProject() {
    if (this.projectForm.valid) {
      this.projectService.addProject(this.projectForm.value);
      this.projects = this.projectService.getProjects();
      this.closeCreateProjectModal();
      alert('Project created successfully!');
    }
  }
}