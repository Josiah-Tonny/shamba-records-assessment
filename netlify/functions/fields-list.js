import { jsonResponse, errorResponse, pool, verifyRequest } from './shared.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  let user
  try {
    user = verifyRequest(event)
  } catch (error) {
    return errorResponse(error.message, 401)
  }

  const fieldId = event.queryStringParameters?.fieldId

  const values = []
  let query = `
    SELECT
      id,
      name,
      crop_type,
      planting_date,
      stage,
      assigned_to,
      created_by,
      updated_at
    FROM fields
  `

  if (user.role === 'agent') {
    values.push(user.id)
    query += ` WHERE assigned_to = $${values.length}`
  }

  if (fieldId) {
    values.push(fieldId)
    query += values.length === 1 ? ` WHERE id = $${values.length}` : ` AND id = $${values.length}`
  }

  query += ' ORDER BY planting_date DESC NULLS LAST'

  const result = await pool.query(query, values)
  const fields = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    cropType: row.crop_type,
    plantingDate: row.planting_date ? row.planting_date.toISOString().substring(0, 10) : null,
    stage: row.stage,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    updatedAt: row.updated_at ? row.updated_at.toISOString().substring(0, 10) : null,
  }))

  return jsonResponse(fields)
}
