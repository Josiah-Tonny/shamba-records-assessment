import { jsonResponse, errorResponse, pool, verifyRequest, optionsResponse } from './_shared.js'

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

  try {
    const fieldId = req.query?.fieldId

    const values = []
    const filters = []

    let query = `
      SELECT
        f.id,
        f.name,
        f.crop_type,
        f.planting_date,
        f.stage,
        f.assigned_to,
        u.name AS assigned_to_name,
        f.created_by,
        f.created_at,
        f.updated_at,
        COALESCE(
          (SELECT MAX(fu.created_at) FROM field_updates fu WHERE fu.field_id = f.id),
          f.created_at
        ) AS last_activity_at
      FROM fields f
      LEFT JOIN users u ON u.id = f.assigned_to
    `

    if (user.role === 'agent') {
      values.push(user.id)
      filters.push(`f.assigned_to = $${values.length}`)
    }

    if (fieldId) {
      values.push(fieldId)
      filters.push(`f.id = $${values.length}`)
    }

    if (filters.length > 0) {
      query += ` WHERE ${filters.join(' AND ')}`
    }

    query += ' ORDER BY f.planting_date DESC NULLS LAST'

    const result = await pool.query(query, values)
    const fields = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      cropType: row.crop_type,
      plantingDate: row.planting_date ? row.planting_date.toISOString().substring(0, 10) : null,
      stage: row.stage,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_to_name,
      createdBy: row.created_by,
      createdAt: row.created_at ? row.created_at.toISOString() : null,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
      lastUpdateAt: row.last_activity_at ? row.last_activity_at.toISOString() : null,
    }))

    return jsonResponse(res, fields)
  } catch (error) {
    console.error('Fields list error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}