import pool from '../db.js';

const getFieldUpdates = async (req, res) => {
  try {
    const { fieldId } = req.params;

    // Check if field exists and user has access
    const fieldResult = await pool.query('SELECT * FROM fields WHERE id = $1', [fieldId]);
    if (fieldResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    const field = fieldResult.rows[0];

    // Agent can only see their own field updates
    if (req.user.role === 'agent' && field.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    // Get updates
    const result = await pool.query(
      `SELECT fu.*, u.name as agent_name
       FROM field_updates fu
       JOIN users u ON fu.agent_id = u.id
       WHERE fu.field_id = $1
       ORDER BY fu.created_at DESC`,
      [fieldId]
    );

    res.json({
      success: true,
      data: { updates: result.rows }
    });
  } catch (error) {
    console.error('Get field updates error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const createFieldUpdate = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { stage, notes } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, error: 'Stage is required' });
    }

    if (!['planted', 'growing', 'ready', 'harvested'].includes(stage)) {
      return res.status(400).json({ success: false, error: 'Invalid stage' });
    }

    // Check if field exists and belongs to user
    const fieldResult = await pool.query('SELECT * FROM fields WHERE id = $1', [fieldId]);
    if (fieldResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    const field = fieldResult.rows[0];

    // Only the assigned agent can post updates
    if (field.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You cannot post updates to this field' });
    }

    // Create update
    const result = await pool.query(
      `INSERT INTO field_updates (field_id, agent_id, stage, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fieldId, req.user.id, stage, notes || null]
    );

    // Update field stage
    await pool.query(
      'UPDATE fields SET stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, fieldId]
    );

    res.status(201).json({
      success: true,
      data: { update: result.rows[0] }
    });
  } catch (error) {
    console.error('Create field update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export { getFieldUpdates, createFieldUpdate };