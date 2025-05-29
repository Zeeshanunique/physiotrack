import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutPlan extends Document {
  _id: string;
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  exercises: {
    exercise: mongoose.Types.ObjectId;
    sets: number;
    reps: number;
    duration: number; // in seconds
    restBetweenSets: number; // in seconds
    notes?: string;
  }[];
  schedule: {
    frequency: number; // times per week
    startDate: Date;
    endDate?: Date;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    timeOfDay?: string; // "morning", "afternoon", "evening"
  };
  goals: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // total duration in minutes
  isTemplate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workoutPlanSchema = new Schema<IWorkoutPlan>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  exercises: [{
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: {
      type: Number,
      required: true,
      min: 1
    },
    reps: {
      type: Number,
      required: true,
      min: 1
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    restBetweenSets: {
      type: Number,
      default: 30
    },
    notes: String
  }],
  schedule: {
    frequency: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening']
    }
  },
  goals: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workoutPlanSchema.index({ createdBy: 1, isActive: 1 });
workoutPlanSchema.index({ assignedTo: 1, isActive: 1 });
workoutPlanSchema.index({ isTemplate: 1, difficulty: 1 });

export const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);
