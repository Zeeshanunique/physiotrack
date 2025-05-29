import { create } from 'zustand';
import { auth } from '../services/api';
import { UserProfile } from '../models/User';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await auth.register(email, password, displayName);
      
      const newUser: UserProfile = {
        id: (user as any).id || (user as any)._id,
        email: (user as any).email,
        displayName: (user as any).displayName,
        createdAt: (user as any).createdAt,
      };
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      set({ 
        user: newUser,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await auth.login(email, password);
      
      const userProfile: UserProfile = {
        id: (user as any).id || (user as any)._id,
        email: (user as any).email,
        displayName: (user as any).displayName,
        createdAt: (user as any).createdAt,
        height: (user as any).height,
        weight: (user as any).weight,
        fitnessLevel: (user as any).fitnessLevel,
        goals: (user as any).goals,
      };
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      set({ 
        user: userProfile,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      set({ 
        user: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }
      
      // Import users from api
      const { users } = await import('../services/api');
      await users.updateProfile(user.id, data);
      
      set({
        user: { ...user, ...data },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  }
}));

// Initialize auth state from localStorage and verify token
const initializeAuth = async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const user = await auth.verifyToken(token);
      if (user) {
        const userProfile: UserProfile = {
          id: (user as any).id || (user as any)._id,
          email: (user as any).email,
          displayName: (user as any).displayName,
          createdAt: (user as any).createdAt,
          height: (user as any).height,
          weight: (user as any).weight,
          fitnessLevel: (user as any).fitnessLevel,
          goals: (user as any).goals,
        };
        
        useAuthStore.setState({ 
          user: userProfile, 
          isInitialized: true 
        });
      } else {
        localStorage.removeItem('authToken');
        useAuthStore.setState({ 
          user: null, 
          isInitialized: true 
        });
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      useAuthStore.setState({ 
        user: null,
        error: (error as Error).message, 
        isInitialized: true 
      });
    }
  } else {
    useAuthStore.setState({ 
      user: null, 
      isInitialized: true 
    });
  }
};

// Initialize auth on app start
initializeAuth();