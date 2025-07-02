import { Injectable } from '@angular/core';
import { Team } from '../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams: Team[] = [
    {
      id: '1',
      name: 'Development',
      department: 'Engineering',
      lead: 'Team Lead',
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
      lead: 'Design Lead',
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
}