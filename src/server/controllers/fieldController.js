import pool from '../db.js';

const getAllFields = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name as assigned_to_name
       FROM fields f
       LEFT JOIN users u ON f.assigned_to = u.id
       ORDER BY f.created_at DESC`
    );

    const fieldsWithStatus = result.rows.map(field => ({
      ...field,
      status: computeStatus(field)
    }));

    res.json({
      success: true,
      data: { fields: fieldsWithStatus }
    });
  } catch (error) {
    console.error('Get all fields error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getMyFields = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name as assigned_to_name
       FROM fields f
       LEFT JOIN users u ON f.assigned_to = u.id
       WHERE f.assigned_to = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const fieldsWithStatus = result.rows.map(field => ({
      ...field,
      status: computeStatus(field)
    }));

    res.json({
      success: true,
      data: { fields: fieldsWithStatus }
    });
  } catch (error) {
    console.error('Get my fields error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT f.*, u.name as assigned_to_name, c.name as created_by_name
       FROM fields f
       LEFT JOIN users u ON f.assigned_to = u.id
       LEFT JOIN users c ON f.created_by = c.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    const field = {
      ...result.rows[0],
      status: computeStatus(result.rows[0])
    };

    res.json({
      success: true,
      data: { field }
    });
  } catch (error) {
    console.error('Get field error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const createField = async (req, res) => {
  try {
    const { name, crop_type, planting_date, assigned_to } = req.body;

    if (!name || !crop_type || !planting_date) {
      return res.status(400).json({ success: false, error: 'Name, crop_type, and planting_date are required' });
    }

    const result = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, crop_type, planting_date, assigned_to || null, req.user.id]
    );

    const field = {
      ...result.rows[0],
      status: computeStatus(result.rows[0])
    };

    res.status(201).json({
      success: true,
      data: { field }
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, crop_type, planting_date, stage, assigned_to } = req.body;

    // Get current field
    const currentResult = await pool.query('SELECT * FROM fields WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    const field = currentResult.rows[0];

    // Update field
    const result = await pool.query(
      `UPDATE fields
       SET name = $1, crop_type = $2, planting_date = $3, stage = $4, assigned_to = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        name || field.name,
        crop_type || field.crop_type,
        planting_date || field.planting_date,
        stage || field.stage,
        assigned_to !== undefined ? assigned_to : field.assigned_to,
        id
      ]
    );

    const updatedField = {
      ...result.rows[0],
      status: computeStatus(result.rows[0])
    };

    res.json({
      success: true,
      data: { field: updatedField }
    });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM fields WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Field not found' });
    }

    res.json({
      success: true,
      data: { message: 'Field deleted successfully' }
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Helper function to compute field status (returns lowercase snake_case)
const computeStatus = (field) => {
  if (field.stage === 'harvested') {
    return 'completed';
  }

  if (['planted', 'growing'].includes(field.stage)) {
    const plantingDate = new Date(field.planting_date);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    if (plantingDate < ninetyDaysAgo) {
      return 'at_risk';
    }
  }

  return 'active';
};

export { getAllFields, getMyFields, getFieldById, createField, updateField, deleteField };