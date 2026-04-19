import express from 'express';
import { register, login, logout, refresh, getMe, getAgents } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh); // Refresh endpoint doesn't need auth middleware

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.get('/agents', authenticateToken, getAgents); // Admin: get all agents for field assignment

export default router;