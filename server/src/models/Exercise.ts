import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  equipment: string[];
  precautions: string[];
  variations: {
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  instructions: [{
    type: String,
    required: true
  }],
  videoUrl: String,
  imageUrl: String,
  targetMuscles: [String],
  equipment: [String],
  precautions: [String],
  variations: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ name: 'text', description: 'text' });

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);
