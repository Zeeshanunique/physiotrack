import { Request, Response } from 'express';
import { Exercise } from '../models/Exercise.js';

// Extend Request interface to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const getExercises = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const exercises = await Exercise.find(query)
      .populate('createdBy', 'displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Exercise.countDocuments(query);

    res.json({
      exercises,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('createdBy', 'displayName');

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const exerciseData = {
      ...req.body,
      createdBy: req.user.id
    };

    const exercise = new Exercise(exerciseData);
    await exercise.save();

    const populatedExercise = await Exercise.findById(exercise._id)
      .populate('createdBy', 'displayName');

    res.status(201).json(populatedExercise);
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check if user owns the exercise or is an admin/therapist
    if (exercise.createdBy.toString() !== req.user.id && 
        !['admin', 'therapist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update this exercise' });
    }

    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'displayName');

    res.json(updatedExercise);
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check if user owns the exercise or is an admin
    if (exercise.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this exercise' });
    }

    // Soft delete by setting isActive to false
    exercise.isActive = false;
    await exercise.save();

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
