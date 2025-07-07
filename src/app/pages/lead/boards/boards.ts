// boards.ts
import { Component, OnInit } from '@angular/core';
import { Task } from '../../../model/user.model';
import { TaskService } from '../../../core/services/task/task';
import { ProjectService } from '../../../core/services/project/project';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lead-boards',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule
  ],
  templateUrl: './boards.html',
  styleUrls: ['./boards.css']
})
export class Boards implements OnInit {
  projects: any[] = [];
  selectedProject: string = '1';
  boardColumns: { id: string; title: string; tasks: Task[] }[] = [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ];
  teamBoards: Array<{ name: string; description: string; tasks: number; members: number }> = [];
  addColumnModalOpen = false;
  addTaskModalOpen = false;
  editTaskModalOpen = false;
  currentTask: Task | null = null;
  newColumnTitle = '';
  newTask: Task = {
    id: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(),
    assignee: '',
    projectId: '1',
    tags: [],
    estimatedHours: 0,
    storyPoints: 3
  };
  teamMembers: any[] = [];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.projects = this.projectService.getProjects();
    this.teamMembers = [
      { id: '1', name: 'Sarah Johnson', role: 'Designer' },
      { id: '2', name: 'Mike Smith', role: 'Developer' },
      { id: '3', name: 'Alex Chen', role: 'Developer' }
    ];
    this.loadBoardTasks();
  }

  loadBoardTasks(): void {
    // Clear existing tasks
    this.boardColumns.forEach(col => col.tasks = []);

    // Load tasks based on selected project
    const tasks = this.getTasksForProject(this.selectedProject);
    
    // Distribute tasks to columns
    tasks.forEach(task => {
      const column = this.boardColumns.find(col => col.id === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  getTasksForProject(projectId: string): Task[] {
    // In a real app, you'd get these from API
    const allTasks: Task[] = [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create initial design concepts',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2023-05-15'),
        assignee: 'Sarah Johnson',
        projectId: '1',
        tags: ['design'],
        estimatedHours: 8,
        storyPoints: 5
      },
      {
        id: '2',
        title: 'Implement user authentication',
        description: 'Set up login and registration',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2023-05-18'),
        assignee: 'Mike Smith',
        projectId: '1',
        tags: ['development'],
        estimatedHours: 12,
        storyPoints: 8
      },
      {
        id: '3',
        title: 'Write API documentation',
        description: 'Document all endpoints',
        status: 'review',
        priority: 'medium',
        dueDate: new Date('2023-05-10'),
        assignee: 'Alex Chen',
        projectId: '1',
        tags: ['documentation'],
        estimatedHours: 5,
        storyPoints: 3
      },
      {
        id: '4',
        title: 'Database schema design',
        description: 'Design the database schema',
        status: 'done',
        priority: 'medium',
        dueDate: new Date('2023-05-05'),
        assignee: 'Mike Smith',
        projectId: '1',
        tags: ['database'],
        estimatedHours: 6,
        storyPoints: 5
      },
      {
        id: '5',
        title: 'Mobile app UI implementation',
        description: 'Implement the UI components',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2023-05-20'),
        assignee: 'Sarah Johnson',
        projectId: '1',
        tags: ['mobile', 'ui'],
        estimatedHours: 15,
        storyPoints: 8
      }
    ];

    return allTasks.filter(task => task.projectId === projectId);
  }

  onProjectChange(): void {
    this.loadBoardTasks();
  }

  openAddColumnModal(): void {
    this.newColumnTitle = '';
    this.addColumnModalOpen = true;
  }

  openAddTaskModal(): void {
    this.newTask = {
      id: '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(),
      assignee: '',
      projectId: this.selectedProject,
      tags: [],
      estimatedHours: 0,
      storyPoints: 3
    };
    this.addTaskModalOpen = true;
  }

  openEditTaskModal(task: Task): void {
    this.currentTask = { ...task };
    this.editTaskModalOpen = true;
  }

  addColumn(): void {
    if (this.newColumnTitle.trim()) {
      const newId = this.newColumnTitle.toLowerCase().replace(/\s+/g, '-');
      this.boardColumns.push({
        id: newId,
        title: this.newColumnTitle,
        tasks: []
      });
      this.addColumnModalOpen = false;
    }
  }

  saveTask(): void {
    if (this.editTaskModalOpen && this.currentTask) {
      // Update existing task
      const column = this.boardColumns.find(col => col.id === this.currentTask?.status);
      if (column) {
        const index = column.tasks.findIndex(t => t.id === this.currentTask?.id);
        if (index !== -1) {
          column.tasks[index] = { ...this.currentTask };
        }
      }
    } else if (this.addTaskModalOpen) {
      // Add new task
      this.newTask.id = 'task' + (this.boardColumns.reduce((acc, col) => acc + col.tasks.length, 0) + 1);
      const todoColumn = this.boardColumns.find(col => col.id === 'todo');
      if (todoColumn) {
        todoColumn.tasks.push({ ...this.newTask });
      }
    }
    
    this.closeModals();
  }

  deleteTask(): void {
    if (this.currentTask) {
      for (const column of this.boardColumns) {
        column.tasks = column.tasks.filter(t => t.id !== this.currentTask?.id);
      }
      this.closeModals();
    }
  }

  deleteColumn(columnId: string): void {
    if (columnId !== 'todo' && columnId !== 'in-progress' && columnId !== 'review' && columnId !== 'done') {
      this.boardColumns = this.boardColumns.filter(col => col.id !== columnId);
    }
  }

  closeModals(): void {
    this.addColumnModalOpen = false;
    this.addTaskModalOpen = false;
    this.editTaskModalOpen = false;
    this.currentTask = null;
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Update task status based on new column
      const task = event.container.data[event.currentIndex];
      task.status = event.container.id as 'todo' | 'in-progress' | 'review' | 'done';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getColumnTaskCount(columnId: string): number {
    const column = this.boardColumns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  }

  getTotalStoryPoints(columnId: string): number {
    const column = this.boardColumns.find(col => col.id === columnId);
    return column ? column.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0) : 0;
  }

  getSelectedProjectName(): string {
    const project = this.projects?.find((p: any) => p.id === this.selectedProject);
    return project?.name || 'Select Project';
  }

  getTotalTasks(): number {
    return this.boardColumns
      ? this.boardColumns.reduce((acc: number, col: any) => acc + (col.tasks ? col.tasks.length : 0), 0)
      : 0;
  }

  onEditTagsInputChange(event: Event): void {
    if (!this.currentTask) return;
    const input = event.target as HTMLInputElement | null;
    this.currentTask.tags = input && input.value
      ? input.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
  }
}