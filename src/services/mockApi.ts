// Mock API service for development - simulates backend responses
import { IUser } from '../models/User';
import { IExercise } from '../models/Exercise';
import { IWorkoutPlan } from '../models/WorkoutPlan';
import { IProgress } from '../models/Progress';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in-memory for development)
let usersData: Array<IUser & { password: string }> = [];
let exercisesData: IExercise[] = [];
let workoutPlansData: IWorkoutPlan[] = [];
let progressData: IProgress[] = [];

let currentUserId = 1;

// Generate mock JWT token
const generateMockToken = (userId: string) => {
  return `mock.jwt.token.${userId}.${Date.now()}`;
};

// Mock authentication
export const mockAuth = {
  async register(email: string, password: string, displayName: string) {
    await delay(500); // Simulate network delay
    
    // Check if user already exists
    if (usersData.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: IUser & { password: string } = {
      _id: `user_${currentUserId++}`,
      email,
      password, // In real app, this would be hashed
      displayName,
      createdAt: new Date(),
    };

    usersData.push(newUser);
    
    const token = generateMockToken(newUser._id!);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  },

  async login(email: string, password: string) {
    await delay(500);
    
    const user = usersData.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // In real app, you'd compare hashed passwords
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    const token = generateMockToken(user._id!);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async verifyToken(token: string) {
    await delay(100);
    
    // Simple token validation (in real app, you'd verify JWT)
    if (!token.startsWith('mock.jwt.token.')) {
      throw new Error('Invalid token');
    }

    const userId = token.split('.')[3];
    const user = usersData.find(u => u._id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

// Mock user operations
export const mockUsers = {
  async updateProfile(userId: string, data: Partial<IUser>) {
    await delay(300);
    
    const userIndex = usersData.findIndex(u => u._id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    usersData[userIndex] = { ...usersData[userIndex], ...data };
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = usersData[userIndex];
    return userWithoutPassword;
  },

  async getProfile(userId: string) {
    await delay(200);
    
    const user = usersData.find(u => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

// Mock exercise operations
export const mockExercises = {
  async getAll() {
    await delay(300);
    return exercisesData;
  },

  async getById(id: string) {
    await delay(200);
    const exercise = exercisesData.find(e => e._id === id);
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    return exercise;
  },

  async create(data: IExercise) {
    await delay(400);
    const newExercise: IExercise = {
      ...data,
      _id: `exercise_${exercisesData.length + 1}`
    };
    exercisesData.push(newExercise);
    return newExercise;
  }
};

// Mock workout plan operations
export const mockWorkoutPlans = {
  async getByUser(userId: string) {
    await delay(300);
    return workoutPlansData.filter(p => p.userId === userId);
  },

  async create(userId: string, data: Partial<IWorkoutPlan>) {
    await delay(400);
    const newPlan: IWorkoutPlan = {
      ...data,
      _id: `plan_${workoutPlansData.length + 1}`,
      userId,
      workouts: data.workouts || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as IWorkoutPlan;
    
    workoutPlansData.push(newPlan);
    return newPlan;
  },

  async update(planId: string, data: Partial<IWorkoutPlan>) {
    await delay(300);
    const planIndex = workoutPlansData.findIndex(p => p._id === planId);
    if (planIndex === -1) {
      throw new Error('Workout plan not found');
    }

    workoutPlansData[planIndex] = { 
      ...workoutPlansData[planIndex], 
      ...data,
      updatedAt: new Date()
    };
    return workoutPlansData[planIndex];
  },

  async delete(planId: string) {
    await delay(300);
    const planIndex = workoutPlansData.findIndex(p => p._id === planId);
    if (planIndex === -1) {
      throw new Error('Workout plan not found');
    }

    workoutPlansData.splice(planIndex, 1);
    return { message: 'Workout plan deleted successfully' };
  }
};

// Mock progress tracking
export const mockProgress = {
  async add(data: IProgress) {
    await delay(400);
    const newProgress: IProgress = {
      ...data,
      _id: `progress_${progressData.length + 1}`,
      date: data.date || new Date()
    };
    progressData.push(newProgress);
    return newProgress;
  },

  async getByUser(userId: string, exerciseId?: string) {
    await delay(300);
    let userProgress = progressData.filter(p => p.userId === userId);
    
    if (exerciseId) {
      userProgress = userProgress.filter(p => p.exerciseId === exerciseId);
    }

    // Sort by date (most recent first)
    return userProgress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getStats(userId: string) {
    await delay(300);
    const userProgress = progressData.filter(p => p.userId === userId);
    
    if (userProgress.length === 0) {
      return {
        totalSets: 0,
        totalReps: 0,
        avgFormScore: 0,
        totalDuration: 0
      };
    }

    const stats = userProgress.reduce((acc, progress) => {
      acc.totalSets += progress.sets;
      acc.totalReps += progress.reps;
      acc.totalDuration += progress.duration;
      acc.formScoreSum += progress.formScore;
      return acc;
    }, { totalSets: 0, totalReps: 0, totalDuration: 0, formScoreSum: 0 });

    return {
      totalSets: stats.totalSets,
      totalReps: stats.totalReps,
      avgFormScore: stats.formScoreSum / userProgress.length,
      totalDuration: stats.totalDuration
    };
  }
};

// Initialize with some mock data
exercisesData.push(
  {
    _id: 'exercise_1',
    name: 'Push-ups',
    description: 'Classic upper body exercise',
    duration: 300,
    difficulty: 'beginner',
    bodyPart: 'upper',
    imageUrl: '/images/pushups.jpg',
    instructions: [
      'Start in a plank position',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position'
    ],
    targetRepetitions: 10,
    restBetweenSets: 60,
    sets: 3
  },
  {
    _id: 'exercise_2',
    name: 'Squats',
    description: 'Lower body strength exercise',
    duration: 240,
    difficulty: 'beginner',
    bodyPart: 'lower',
    imageUrl: '/images/squats.jpg',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Return to standing position'
    ],
    targetRepetitions: 15,
    restBetweenSets: 45,
    sets: 3
  }
);