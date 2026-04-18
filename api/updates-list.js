import { jsonResponse, errorResponse, pool, verifyRequest, optionsResponse } from '../api/_shared.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  let user
  try {
    user = verifyRequest(req)
  } catch (error) {
    return errorResponse(res, error.message, 401)
  }

  const fieldId = req.query?.fieldId
  if (!fieldId) {
    return errorResponse(res, 'Field ID is required', 400)
  }

  const fieldResult = await pool.query('SELECT assigned_to FROM fields WHERE id = $1', [fieldId])
  if (fieldResult.rowCount === 0) {
    return errorResponse(res, 'Field not found', 404)
  }

  if (user.role === 'agent' && fieldResult.rows[0].assigned_to !== user.id) {
    return errorResponse(res, 'Agent may only view updates for assigned fields', 403)
  }

  const statement = `
    SELECT
      fu.id,
      fu.field_id,
      fu.stage,
      fu.notes,
      fu.created_at,
      u.id AS agent_id,
      u.name AS agent_name,
      u.email AS agent_email
    FROM field_updates fu
    LEFT JOIN users u ON u.id = fu.agent_id
    WHERE fu.field_id = $1
    ORDER BY fu.created_at DESC
  `

  const result = await pool.query(statement, [fieldId])
  const updates = result.rows.map((row) => ({
    id: row.id,
    fieldId: row.field_id,
    stage: row.stage,
    notes: row.notes,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    agent: {
      id: row.agent_id,
      name: row.agent_name,
      email: row.agent_email,
    },
  }))

  return jsonResponse(res, updates)
}