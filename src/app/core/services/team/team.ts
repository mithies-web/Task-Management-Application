import { Injectable } from '@angular/core';
import { Team } from '../../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams: Team[] = [
    {
      id: '1',
      name: 'Development',
      department: 'Engineering',
      lead: 'Gokul',
      members: 8,
      projects: 5,
      completionRate: 75,
      description: 'Handles all development tasks',
      parentTeam: null,
      subTeams: []
    },
    {
      id: '2',
      name: 'Design',
      department: 'Creative',
      lead: 'Abishek',
      members: 4,
      projects: 3,
      completionRate: 85,
      description: 'Responsible for product design',
      parentTeam: null,
      subTeams: []
    }
  ];

  getTeams(): Team[] {
    return this.teams;
  }

  addTeam(team: Team): void {
    this.teams.push(team);
  }

  updateTeam(team: Team): void {
    const index = this.teams.findIndex(t => t.id === team.id);
    if (index !== -1) {
      this.teams[index] = { ...team };
    }
  }

  deleteTeam(teamId: string): void {
    this.teams = this.teams.filter(team => team.id !== teamId);
  }
}