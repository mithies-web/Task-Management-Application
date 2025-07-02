export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  username?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  team?: string | null;
  status?: string;
  employeeType?: string;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  address?: string;
  about?: string;
  profileImg?: string;
  performance?: {
    taskCompletion: number;
    onTimeDelivery: number;
    qualityRating: number;
    projects: string[];
  };
}

export enum UserRole {
  ADMIN = 'admin',
  LEAD = 'team-lead',
  USER = 'user'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  lead: string;
  members: number;
  projects: number;
  completionRate: number;
  description: string;
  parentTeam: string | null;
  subTeams: Team[];
}

export interface Project {
  id: string;
  name: string;
  team: string;
  startDate: string;
  deadline: string;
  status: string;
  progress: number;
  priority: string;
}