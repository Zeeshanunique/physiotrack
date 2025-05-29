import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  workoutPlanId?: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  sessionDate: Date;
  duration: number; // actual duration in seconds
  completedSets: number;
  completedReps: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  painLevel: number; // 0-10 scale
  effort: number; // 1-10 scale
  notes?: string;
  aiAnalysis?: {
    formAccuracy: number; // percentage
    completionRate: number; // percentage
    recommendations: string[];
    improvements: string[];
  };
  vitals?: {
    heartRate?: number;
    restingHeartRate?: number;
    caloriesBurned?: number;
  };
  mood?: {
    before: number; // 1-10 scale
    after: number; // 1-10 scale
  };
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  completedSets: {
    type: Number,
    required: true,
    min: 0
  },
  completedReps: {
    type: Number,
    required: true,
    min: 0
  },
  quality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent'],
    required: true
  },
  painLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  effort: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: String,
  aiAnalysis: {
    formAccuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [String],
    improvements: [String]
  },
  vitals: {
    heartRate: Number,
    restingHeartRate: Number,
    caloriesBurned: Number
  },
  mood: {
    before: {
      type: Number,
      min: 1,
      max: 10
    },
    after: {
      type: Number,
      min: 1,
      max: 10
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
progressSchema.index({ userId: 1, sessionDate: -1 });
progressSchema.index({ exerciseId: 1, sessionDate: -1 });
progressSchema.index({ workoutPlanId: 1, sessionDate: -1 });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
