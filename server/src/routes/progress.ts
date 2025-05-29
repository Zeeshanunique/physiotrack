import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get progress for user
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Progress endpoint - coming soon' });
});

// Get progress by ID
router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Progress by ID endpoint - coming soon' });
});

// Create progress entry
router.post('/', authenticateToken, (req, res) => {
  res.json({ message: 'Create progress endpoint - coming soon' });
});

// Update progress entry
router.put('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Update progress endpoint - coming soon' });
});

// Delete progress entry
router.delete('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Delete progress endpoint - coming soon' });
});

export default router;
