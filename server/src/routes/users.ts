import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Users endpoint - coming soon' });
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'User by ID endpoint - coming soon' });
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Update user endpoint - coming soon' });
});

export default router;
