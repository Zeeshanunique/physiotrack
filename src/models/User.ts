// Frontend User interface - no mongoose or bcrypt dependencies
export interface IUser {
  _id?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  height?: number;
  weight?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  height?: number;
  weight?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
}