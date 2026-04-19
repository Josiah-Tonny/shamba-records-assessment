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
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// GET /api/fields/mine - Agent's assigned fields
router.get('/mine', authenticate, async (req, res) => {
  try {
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

    res.json({ success: true, data: { fields: result.rows } });
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

    res.json({ success: true, data: { fields: result.rows } });
  } catch (error) {
    console.error('Fetch all error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/fields/:id - Get field details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name as assigned_to_name 
       FROM fields f 
       LEFT JOIN users u ON f.assigned_to = u.id 
       WHERE f.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    const field = result.rows[0];

    // Access control: admins see all, agents only see assigned
    if (req.userRole !== 'admin' && field.assigned_to !== req.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: { field } });
  } catch (error) {
    console.error('Fetch field error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/fields/:id/updates - Get update history
router.get('/:id/updates', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fu.*, u.name as agent_name 
       FROM field_updates fu
       JOIN users u ON fu.agent_id = u.id
       WHERE fu.field_id = $1
       ORDER BY fu.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { updates: result.rows } });
  } catch (error) {
    console.error('Fetch updates error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/fields/:id/updates - Post a new update (agents only)
router.post('/:id/updates', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ success: false, error: 'Only agents can post updates' });
    }

    const { stage, notes } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, error: 'Stage is required' });
    }

    // Insert update
    await pool.query(
      'INSERT INTO field_updates (field_id, agent_id, stage, notes) VALUES ($1, $2, $3, $4)',
      [req.params.id, req.userId, stage, notes]
    );

    // Update field stage
    await pool.query(
      'UPDATE fields SET stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, req.params.id]
    );

    res.status(201).json({ success: true, message: 'Update posted successfully' });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/fields - Create (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { name, crop_type, planting_date, assigned_to } = req.body;

    const result = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, crop_type, planting_date, assigned_to, req.userId]
    );

    res.status(201).json({ success: true, data: { field: result.rows[0] } });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
