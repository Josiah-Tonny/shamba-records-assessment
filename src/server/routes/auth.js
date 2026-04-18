import express from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh); // Refresh endpoint doesn't need auth middleware

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

export default router;