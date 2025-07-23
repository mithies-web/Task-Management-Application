export interface User {
  _id: string;
  id?: string;
  numericalId: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'team-lead' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'on-leave';
  phone?: string;
  gender?: 'male' | 'female' | 'other' | '';
  dob?: string;
  department?: string;
  team?: string | null;
  employeeType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  location?: 'office' | 'remote' | 'hybrid';
  joinDate?: string;
  lastActive?: string;
  address?: string;
  about?: string;
  profileImg?: string;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'project' | 'team' | 'task' | 'general';
    projectId?: string;
    memberId?: string;
    taskId?: string;
  }>;
  performance?: {
    taskCompletion: number;
    onTimeDelivery: number;
    qualityRating: number;
    projects: string[];
  };
  completionRate?: number;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'team-lead' | 'user';
}

export interface UserProfile {
  name?: string;
  phone?: string;
  address?: string;
  about?: string;
  profileImg?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}