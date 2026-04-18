import { jsonResponse, errorResponse, pool, verifyRequest, optionsResponse } from '../api/_shared.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  let user
  try {
    user = verifyRequest(req)
  } catch (error) {
    return errorResponse(res, error.message, 401)
  }

  if (user.role !== 'agent') {
    return errorResponse(res, 'Agent access required', 403)
  }

  if (!req.body) {
    return errorResponse(res, 'Missing request body', 400)
  }

  const { fieldId, stage, notes } = req.body
  if (!fieldId || !stage) {
    return errorResponse(res, 'Field ID and stage are required', 400)
  }

  const fieldResult = await pool.query('SELECT assigned_to FROM fields WHERE id = $1', [fieldId])
  if (fieldResult.rowCount === 0) {
    return errorResponse(res, 'Field not found', 404)
  }

  if (fieldResult.rows[0].assigned_to !== user.id) {
    return errorResponse(res, 'Agent can only add updates for assigned fields', 403)
  }

  const statement = `
    INSERT INTO field_updates (field_id, agent_id, stage, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING id, field_id, agent_id, stage, notes, created_at
  `
  const result = await pool.query(statement, [fieldId, user.id, stage, notes || null])
  const update = result.rows[0]

  await pool.query('UPDATE fields SET stage = $1, updated_at = NOW() WHERE id = $2', [stage, fieldId])

  return jsonResponse(res, {
    id: update.id,
    fieldId: update.field_id,
    agentId: update.agent_id,
    stage: update.stage,
    notes: update.notes,
    createdAt: update.created_at ? update.created_at.toISOString() : null,
  }, 201)
}