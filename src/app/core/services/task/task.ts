// core/services/task/task.ts
import { Injectable } from '@angular/core';
import { Task } from '../../../model/user.model';
import { Observable, of, Subject } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  public tasksUpdated$ = new Subject<void>();
  constructor(private localStorage: LocalStorageService) {
    // Demo Setup: Initialize with some sample data if none exists.
    if (!this.localStorage.getTasks()) {
      this.addSampleDataForDemo();
    }
  }

  getTasks(): Observable<Task[]> {
    const tasks = this.localStorage.getTasks<Task[]>() || [];
    return of(tasks);
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    const tasks = (this.localStorage.getTasks<Task[]>() || []).filter(task => task.projectId === projectId);
    return of(tasks);
  }

  getTaskById(id: string): Observable<Task | undefined> {
    const task = (this.localStorage.getTasks<Task[]>() || []).find(task => task.id === id);
    return of(task);
  }

  updateTask(updatedTask: Task): void {
    let tasks = this.localStorage.getTasks<Task[]>() || [];
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.localStorage.saveTasks(tasks);
    }
  }

  addTask(newTask: Task): void {
    let tasks = this.localStorage.getTasks<Task[]>() || [];
    tasks.push(newTask);
    this.localStorage.saveTasks(tasks);
  }

  deleteTask(taskId: string): void {
    let tasks = (this.localStorage.getTasks<Task[]>() || []).filter(t => t.id !== taskId);
    this.localStorage.saveTasks(tasks);
  }

  private addSampleDataForDemo(): void {
    const sampleTasks: Task[] = [
        { id: 'task-1', title: 'Design Homepage Mockups', description: 'Create Figma designs for the new homepage.', dueDate: new Date('2025-07-25'), status: 'in-progress', priority: 'high', assignee: 'Mithies P', projectId: 'proj-1', storyPoints: 5, tags: ['design', 'figma'] },
        { id: 'task-2', title: 'Develop Login API', description: 'Setup JWT authentication endpoint.', dueDate: new Date('2025-07-28'), status: 'todo', priority: 'high', assignee: 'Abdullah Firdowsi', projectId: 'proj-1', storyPoints: 8, tags: ['backend', 'api'] },
        { id: 'task-3', title: 'Setup Staging Environment', description: 'Configure the staging server on AWS.', dueDate: new Date('2025-07-22'), status: 'done', priority: 'medium', assignee: 'Mithies P', projectId: 'proj-1', storyPoints: 3, tags: ['devops'] },
        { id: 'task-4', title: 'User Testing for Onboarding', description: 'Conduct user testing sessions.', dueDate: new Date('2025-08-01'), status: 'review', priority: 'medium', assignee: 'Hema Dharshini', projectId: 'proj-1', storyPoints: 5, tags: ['testing', 'ux'] },
        { id: 'task-5', title: 'Plan App Store Listing', description: 'Prepare screenshots and description for app stores.', dueDate: new Date('2025-08-10'), status: 'todo', priority: 'medium', assignee: 'Hema Dharshini', projectId: 'proj-2', storyPoints: 3, tags: ['marketing'] },
    ];
    this.localStorage.saveTasks(sampleTasks);
  }

  getTasksByAssignee(assigneeName: string): Observable<Task[]> {
    // Replace this mock with a real API call in production
    return of([]);
  }
}