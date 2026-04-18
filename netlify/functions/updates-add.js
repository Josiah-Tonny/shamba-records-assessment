import { jsonResponse, errorResponse, pool, verifyRequest } from './shared.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  let user
  try {
    user = verifyRequest(event)
  } catch (error) {
    return errorResponse(error.message, 401)
  }

  if (user.role !== 'agent') {
    return errorResponse('Agent access required', 403)
  }

  if (!event.body) {
    return errorResponse('Missing request body', 400)
  }

  const { fieldId, stage, notes } = JSON.parse(event.body)
  if (!fieldId || !stage) {
    return errorResponse('Field ID and stage are required', 400)
  }

  const fieldResult = await pool.query('SELECT assigned_to FROM fields WHERE id = $1', [fieldId])
  if (fieldResult.rowCount === 0) {
    return errorResponse('Field not found', 404)
  }

  if (fieldResult.rows[0].assigned_to !== user.id) {
    return errorResponse('Agent can only add updates for assigned fields', 403)
  }

  const statement = `
    INSERT INTO field_updates (field_id, agent_id, stage, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING id, field_id, agent_id, stage, notes, created_at
  `
  const result = await pool.query(statement, [fieldId, user.id, stage, notes || null])
  const update = result.rows[0]

  await pool.query('UPDATE fields SET stage = $1, updated_at = NOW() WHERE id = $2', [stage, fieldId])

  return jsonResponse({
    id: update.id,
    fieldId: update.field_id,
    agentId: update.agent_id,
    stage: update.stage,
    notes: update.notes,
    createdAt: update.created_at ? update.created_at.toISOString() : null,
  }, 201)
}
