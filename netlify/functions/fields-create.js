import { jsonResponse, errorResponse, pool, verifyRequest } from './shared.js'

function formatField(row) {
  return {
    id: row.id,
    name: row.name,
    cropType: row.crop_type,
    plantingDate: row.planting_date ? row.planting_date.toISOString().substring(0, 10) : null,
    stage: row.stage,
    assignedTo: row.assigned_to,
    createdBy: row.created_by,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
  }
}

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

  if (user.role !== 'admin') {
    return errorResponse('Admin access required', 403)
  }

  if (!event.body) {
    return errorResponse('Missing request body', 400)
  }

  const { name, cropType, plantingDate, stage = 'Planted', assignedTo } = JSON.parse(event.body)

  if (!name || !cropType || !plantingDate) {
    return errorResponse('Name, crop type, and planting date are required', 400)
  }

  const statement = `
    INSERT INTO fields (name, crop_type, planting_date, stage, assigned_to, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, crop_type, planting_date, stage, assigned_to, created_by, created_at, updated_at
  `

  const result = await pool.query(statement, [name, cropType, plantingDate, stage, assignedTo || null, user.id])
  const field = result.rows[0]

  return jsonResponse(formatField(field), 201)
}
