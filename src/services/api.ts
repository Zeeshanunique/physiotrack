// Frontend API service - makes HTTP requests to backend
import { IUser } from '../models/User';
import { IExercise } from '../models/Exercise';
import { IWorkoutPlan } from '../models/WorkoutPlan';
import { IProgress } from '../models/Progress';
import { 
  mockAuth, 
  mockUsers, 
  mockExercises, 
  mockWorkoutPlans, 
  mockProgress 
} from './mockApi';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Default to true for development

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication
export const auth = {
  async register(email: string, password: string, displayName: string) {
    if (USE_MOCK_API) {
      return mockAuth.register(email, password, displayName);
    }
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  async login(email: string, password: string) {
    if (USE_MOCK_API) {
      return mockAuth.login(email, password);
    }
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async verifyToken(token: string) {
    if (USE_MOCK_API) {
      return mockAuth.verifyToken(token);
    }
    return apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
};

// User operations
export const users = {
  async updateProfile(userId: string, data: Partial<IUser>) {
    if (USE_MOCK_API) {
      return mockUsers.updateProfile(userId, data);
    }
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getProfile(userId: string) {
    if (USE_MOCK_API) {
      return mockUsers.getProfile(userId);
    }
    return apiRequest(`/users/${userId}`, {
      method: 'GET',
    });
  }
};

// Exercise operations
export const exercises = {
  async getAll() {
    if (USE_MOCK_API) {
      return mockExercises.getAll();
    }
    return apiRequest('/exercises', {
      method: 'GET',
    });
  },

  async getById(id: string) {
    if (USE_MOCK_API) {
      return mockExercises.getById(id);
    }
    return apiRequest(`/exercises/${id}`, {
      method: 'GET',
    });
  },

  async create(data: IExercise) {
    if (USE_MOCK_API) {
      return mockExercises.create(data);
    }
    return apiRequest('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// Workout plan operations
export const workoutPlans = {
  async getByUser(userId: string) {
    if (USE_MOCK_API) {
      return mockWorkoutPlans.getByUser(userId);
    }
    return apiRequest(`/workout-plans/user/${userId}`, {
      method: 'GET',
    });
  },

  async create(userId: string, data: Partial<IWorkoutPlan>) {
    if (USE_MOCK_API) {
      return mockWorkoutPlans.create(userId, data);
    }
    return apiRequest('/workout-plans', {
      method: 'POST',
      body: JSON.stringify({ ...data, userId }),
    });
  },

  async update(planId: string, data: Partial<IWorkoutPlan>) {
    if (USE_MOCK_API) {
      return mockWorkoutPlans.update(planId, data);
    }
    return apiRequest(`/workout-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(planId: string) {
    if (USE_MOCK_API) {
      return mockWorkoutPlans.delete(planId);
    }
    return apiRequest(`/workout-plans/${planId}`, {
      method: 'DELETE',
    });
  }
};

// Progress tracking
export const progress = {
  async add(data: IProgress) {
    if (USE_MOCK_API) {
      return mockProgress.add(data);
    }
    return apiRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getByUser(userId: string, exerciseId?: string) {
    if (USE_MOCK_API) {
      return mockProgress.getByUser(userId, exerciseId);
    }
    const queryParams = exerciseId ? `?exerciseId=${exerciseId}` : '';
    return apiRequest(`/progress/user/${userId}${queryParams}`, {
      method: 'GET',
    });
  },

  async getStats(userId: string) {
    if (USE_MOCK_API) {
      return mockProgress.getStats(userId);
    }
    return apiRequest(`/progress/stats/${userId}`, {
      method: 'GET',
    });
  }
};