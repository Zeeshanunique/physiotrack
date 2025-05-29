import express from 'express';
import { 
  getExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../controllers/exerciseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getExercises);
router.get('/:id', getExerciseById);

// Protected routes
router.post('/', authenticateToken, requireRole(['therapist', 'admin']), createExercise);
router.put('/:id', authenticateToken, updateExercise);
router.delete('/:id', authenticateToken, deleteExercise);

export default router;
