import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Design homepage mockup',
      description: 'Create initial design concepts for the homepage',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2023-05-15'),
      assignee: 'Sarah Johnson',
      projectId: '1',
      tags: ['design']
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Set up login and registration functionality',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2023-05-18'),
      assignee: 'Mike Smith',
      projectId: '1',
      tags: ['development']
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all endpoints for backend services',
      status: 'review',
      priority: 'medium',
      dueDate: new Date('2023-05-10'),
      assignee: 'Alex Chen',
      projectId: '1',
      tags: ['documentation']
    },
    {
      id: '4',
      title: 'Create sitemap',
      description: 'Outline website structure and pages',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2023-05-16'),
      assignee: 'Sarah Johnson',
      projectId: '1',
      tags: ['design']
    },
    {
      id: '5',
      title: 'Design color scheme',
      description: 'Create brand color palette',
      status: 'todo',
      priority: 'low',
      dueDate: new Date('2023-05-17'),
      assignee: 'Sarah Johnson',
      projectId: '1',
      tags: ['design']
    },
    {
      id: '6',
      title: 'Create UI components',
      description: 'Design reusable UI elements',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date('2023-05-18'),
      assignee: 'Sarah Johnson',
      projectId: '1',
      tags: ['design']
    },
    {
      id: '7',
      title: 'Design about page',
      description: 'Create layout for about us page',
      status: 'review',
      priority: 'low',
      dueDate: new Date('2023-05-14'),
      assignee: 'Sarah Johnson',
      projectId: '1',
      tags: ['design']
    },
    {
      id: '8',
      title: 'Project kickoff',
      description: 'Initial project meeting',
      status: 'done',
      priority: 'high',
      dueDate: new Date('2023-05-01'),
      assignee: 'Team',
      projectId: '1',
      tags: ['meeting']
    },
    {
      id: '9',
      title: 'User research',
      description: 'Conduct user interviews',
      status: 'done',
      priority: 'medium',
      dueDate: new Date('2023-05-05'),
      assignee: 'Team',
      projectId: '1',
      tags: ['research']
    },
    {
      id: '10',
      title: 'Implement payment gateway',
      description: 'Integrate Stripe payment system',
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2023-06-01'),
      assignee: 'Mike Smith',
      projectId: '1',
      tags: ['development']
    },
    {
      id: '11',
      title: 'Create admin dashboard',
      description: 'Build interface for admin users',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2023-06-05'),
      assignee: 'Alex Chen',
      projectId: '1',
      tags: ['development']
    },
    {
      id: '12',
      title: 'Optimize image loading',
      description: 'Implement lazy loading for images',
      status: 'todo',
      priority: 'low',
      dueDate: new Date('2023-06-10'),
      assignee: 'Mike Smith',
      projectId: '1',
      tags: ['performance']
    }
  ];

  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);

  constructor() { }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return of(this.tasks.filter(task => task.projectId === projectId));
  }

  getTasksByStatus(projectId: string, status: Task['status']): Observable<Task[]> {
    return of(this.tasks.filter(task => 
      task.projectId === projectId && 
      task.status === status
    ));
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    const newTask: Task = {
      ...task,
      id: uuidv4()
    };
    this.tasks.push(newTask);
    this.tasksSubject.next(this.tasks);
    return of(newTask);
  }

  updateTaskStatus(taskId: string, newStatus: Task['status']): Observable<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = newStatus;
      this.tasksSubject.next(this.tasks);
      return of(this.tasks[taskIndex]);
    }
    throw new Error('Task not found');
  }

  getOverdueTasks(projectId: string): Observable<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return of(this.tasks.filter(task => 
      task.projectId === projectId && 
      new Date(task.dueDate) < today && 
      task.status !== 'done'
    ));
  }

  searchTasks(query: string): Observable<Task[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.tasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    ));
  }

  deleteTask(taskId: string): Observable<boolean> {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.tasksSubject.next(this.tasks);
    return of(this.tasks.length < initialLength);
  }

  updateTask(task: Task): Observable<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = task;
      this.tasksSubject.next(this.tasks);
      return of(task);
    }
    throw new Error('Task not found');
  }

  getTaskById(taskId: string): Observable<Task | undefined> {
    return of(this.tasks.find(task => task.id === taskId));
  }

  getTasksByAssignee(assignee: string): Observable<Task[]> {
    return of(this.tasks.filter(task => task.assignee === assignee));
  }
}