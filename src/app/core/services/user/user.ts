import { Injectable } from '@angular/core';
import { User, UserRole } from '../../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Admin',
      email: 'admin@genworx.ai',
      role: UserRole.ADMIN,
      status: 'active',
      team: 'Management',
      profileImg: 'public/assets/emp2.jpg'
    },
    {
      id: '2',
      name: 'Thirunavukarasu KM',
      email: 'thirunavukarasu@gmail.com',
      role: UserRole.LEAD,
      status: 'active',
      team: 'Development',
      profileImg: 'public/assets/emp1.jpg'
    },
    {
      id: '3',
      name: 'Mithies P',
      email: 'mithiesoff@gamil.com',
      role: UserRole.USER,
      status: 'active',
      team: 'Development',
      profileImg: 'public/assets/profile1.JPG'
    }
  ];

  private teamMembers: User[] = [
    {
      id: '1',
      name: 'Mithies P',
      email: 'mithiesoff@gamil.com',
      role: UserRole.USER,
      status: 'active',
      team: 'Development',
      profileImg: 'public/assets/profile1.JPG'
    },
    {
      id: '4',
      name: 'Sandeep',
      email: 'sandeepsolai@gmail.com',
      role: UserRole.USER,
      status: 'active',
      team: 'Development',
      profileImg: 'public/assets/profile1.JPG'
    }
  ];

  getUsers(): User[] {
    return this.users;
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter(user => user.id !== userId);
  }

  updateUser(updatedUser: User): void {
    const index = this.users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { ...updatedUser };
    }
  }

  getTeamMembers() {
    return this.teamMembers;
  }
}