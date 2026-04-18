import express from 'express';
import { getAllFields, getMyFields, getFieldById, createField, updateField, deleteField } from '../controllers/fieldController.js';
import { getFieldUpdates, createFieldUpdate } from '../controllers/updateController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Fields routes
router.get('/', requireRole('admin'), getAllFields);         // Admin: get all fields
router.get('/mine', getMyFields);                              // Agent: get assigned fields
router.get('/:id', getFieldById);                              // Get single field
router.post('/', requireRole('admin'), createField);           // Admin: create field
router.put('/:id', requireRole('admin'), updateField);         // Admin: update field
router.delete('/:id', requireRole('admin'), deleteField);      // Admin: delete field

// Field updates routes
router.get('/:fieldId/updates', getFieldUpdates);              // Get field update history
router.post('/:fieldId/updates', createFieldUpdate);           // Agent: post update

export default router;