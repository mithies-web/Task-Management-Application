// user.model.ts
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  username?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  team?: string | null;
  status: string;
  employeeType?: string;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  address?: string;
  about?: string;
  profileImg?: string;
  password?: string;
  performance?: {
    taskCompletion: number;
    onTimeDelivery: number;
    qualityRating: number;
    projects: string[];
  };
  projects?: {
    length: number;
  };
  completionRate?: number;
  selected?: boolean;
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
  lead?: string;
  members: number;
  projects: number;
  completionRate: number;
  description?: string;
  parentTeam?: string | null;
  subTeams?: Team[];
  createdAt?: Date;
  updatedAt?: Date;
  membersList?: string[];
  projectList?: string[];
  performanceMetrics?: {
    taskCompletion: number;
    onTimeDelivery: number;
    qualityRating: number;
  };
}

export interface TeamDetails extends Team {
  hierarchy?: TeamHierarchy[];
  leadDetails?: User | null;
  memberDetails?: User[];
  projectDetails?: Project[];
}

export interface TeamHierarchy {
  id: string;
  name: string;
  level: number;
  members: number;
  projects: number;
}

export interface Project {
  id: string;
  name: string;
  team: string;
  startDate: string;
  deadline: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  teamMembers?: string[];
  tasks?: Task[];
  createdAt?: Date;
  updatedAt?: Date;
  endDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  completionDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags: string[]; 
  progress?: number;
  storyPoints?: number;
}