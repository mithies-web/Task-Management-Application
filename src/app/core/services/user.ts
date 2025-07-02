import { Injectable } from '@angular/core';
import { User, UserRole } from '../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@genworx.ai',
      role: UserRole.ADMIN,
      status: 'active',
      team: 'Management',
      profileImg: 'assets/images/profile1.jpg'
    },
    {
      id: '2',
      name: 'Team Lead',
      email: 'lead@genworx.ai',
      role: UserRole.LEAD,
      status: 'active',
      team: 'Development',
      profileImg: 'assets/images/profile2.jpg'
    },
    {
      id: '3',
      name: 'Regular User',
      email: 'user@genworx.ai',
      role: UserRole.USER,
      status: 'active',
      team: 'Development',
      profileImg: 'assets/images/profile3.jpg'
    }
  ];

  getUsers(): User[] {
    return this.users;
  }

  deleteUser(id: string): void {
    this.users = this.users.filter(user => user.id !== id);
  }
}