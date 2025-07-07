import { Injectable } from '@angular/core';
import { User, UserRole } from '../../../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Thirunavukarasu KM',
      username: 'thiru',
      email: 'thirunavukarasu@gmail.com',
      role: UserRole.LEAD,
      status: 'active',
      team: 'E-Commerce',
      phone: '+91 7092984349',
      gender: 'Male',
      dob: 'Mar 03 2004',
      department: 'Design',
      employeeType: 'Intern',
      location: 'Hybrid',
      joinDate: '03-04-2025',
      lastActive: '03-07-2025',
      address: '1250, Vivekanandha Nagar, Chettimandabam Ullur, Kumbakonam, Thanjavur - 612001',
      profileImg: 'public/assets/user-images/thiru.jpg'
    },
    {
      id: '2',
      name: 'Mithies P',
      username: 'mithies23',
      phone: '+91 6383350764',
      email: 'mithiesofficial@gamil.com',
      role: UserRole.USER,
      status: 'active',
      gender: 'Male',
      dob: 'Jun 23 2004',
      department: 'Design',
      team: 'GenFlow',
      employeeType: 'Full-time',
      location: 'Remote',
      joinDate: '04-03-2025',
      lastActive: '04-07-2025',
      address: '1, Thippichettiplayam, Thottiplayam, Jambai(PO), Bhavani(TK), Erode(DT) - 638312',
      profileImg: 'public/assets/user-images/mithies.JPG'
    },
    {
      id: '3',
      name: 'Hema Dharshini',
      username: 'hemad',
      phone: '+91 936586559',
      gender: 'Female',
      email: 'dkhemadharshini@gmail.com',
      role: UserRole.LEAD,
      status: 'active',
      dob: 'Nov 15 2003',
      joinDate: '04-04-2025',
      lastActive: 'Jul 04 2025',
      department: 'Operations',
      team: 'Quality Control',
      location: 'Office',
      employeeType: 'Full-time',
      address: '"267 B Kamaraj Nagar, Kattukottai, Vadachennimalai, Attur - 636121',
      profileImg: 'public/assets/user-images/hema.jpg'
    },
    {
      id: '4',
      name: 'Sandeep',
      username: 'sandeep55',
      phone: '+91 9361052128',
      gender: 'Male',
      email: 'sandeepsolai@gmail.com',
      role: UserRole.USER,
      status: 'inactive',
      dob: 'May 21 2003',
      joinDate: '04-03-2025',
      lastActive: 'Jun 30 2025',
      department: 'Marketing',
      team: 'Sales',
      location: 'Hybrid',
      employeeType: 'Part-time',
      address: '5/9, Marappampalayam Pudhur, Middle Cross, Paramathivelur-TK, Nmakkal - 637210',
      profileImg: 'public/assets/user-images/sandeep.png'
    },
    {
      id: '5',
      name: 'Abdullah Firdowsi',
      username: 'abdullah52',
      phone: '+91 9943980796',
      gender: 'Male',
      email: 'abdullahfirdowsi@gmail.com',
      role: UserRole.USER,
      status: 'suspended',
      dob: 'Feb 05 2004',
      joinDate: '04-05-2025',
      lastActive: 'Jul 02 2025',
      department: 'Human Resource',
      team: 'Recuritment',
      location: 'Hybrid',
      employeeType: 'Full-time',
      address: '51/35, East Street, Mangalampet, Cuddalore - 606104',
      profileImg: 'public/assets/user-images/firdowsi.png'
    },
    {
      id: '6',
      name: 'Madhanegha',
      username: 'madhanegha52',
      phone: '+91 8438567919',
      gender: 'Female',
      email: 'madhanegha@gmail.com',
      role: UserRole.USER,
      status: 'on-leave',
      dob: 'Nov 17 2004',
      joinDate: '03-05-2025',
      lastActive: 'Jul 02 2025',
      department: 'Design',
      team: 'UI/UX',
      location: 'Remote',
      employeeType: 'Part-time',
      address: '177,K N P Subramaniam nagar, K G pudur road,Tiruppur - 641604',
      profileImg: 'public/assets/user-images/madhanegha.jpg'
    },
    {
      id: '7',
      name: 'Chandra Aadhitya',
      username: 'caadhithya43',
      phone: '+91 8344461345',
      gender: 'Male',
      email: 'capilot@gmail.com',
      role: UserRole.USER,
      status: 'active',
      dob: 'Mar 01 2004',
      joinDate: '01-05-2025',
      lastActive: 'Jul 01 2025',
      department: 'Sales',
      team: 'Account Management',
      location: 'Office',
      employeeType: 'Contract',
      address: '9/277 Kamraj Nagar, Bodipatti, Udumalpet, Tirupur - 642154',
      profileImg: 'public/assets/user-images/aadhi.png'
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