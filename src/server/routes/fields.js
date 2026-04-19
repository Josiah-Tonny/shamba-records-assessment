import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

// Auth middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// GET /api/fields/mine - Agent's assigned fields
router.get('/mine', authenticate, async (req, res) => {
  try {
    // Only agents can access their own fields
    if (req.userRole !== 'agent') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT f.*, u.name as agent_name 
       FROM fields f 
       LEFT JOIN users u ON f.assigned_to = u.id 
       WHERE f.assigned_to = $1 
       ORDER BY f.created_at DESC`,
      [req.userId]
    );

    res.json({ success: true, fields: result.rows });
  } catch (error) {
    console.error('Fetch mine error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/fields - All fields (admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT f.*, u.name as agent_name 
       FROM fields f 
       LEFT JOIN users u ON f.assigned_to = u.id 
       ORDER BY f.created_at DESC`
    );

    res.json({ success: true, fields: result.rows });
  } catch (error) {
    console.error('Fetch all error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;