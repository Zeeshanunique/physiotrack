// Frontend WorkoutPlan interfaces - no mongoose dependencies
export interface IWorkoutEvent {
  _id?: string;
  title: string;
  date: Date;
  startTime: string;
  duration: number;
  exerciseIds: string[];
  notes?: string;
  completed: boolean;
}

export interface IWorkoutPlan {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  workouts: IWorkoutEvent[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

