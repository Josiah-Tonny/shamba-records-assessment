import { jsonResponse, errorResponse, getPool, verifyRequest, optionsResponse } from './_shared.js'

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'PUT') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  let user
  try {
    user = verifyRequest(req)
  } catch (error) {
    return errorResponse(res, error.message, 401)
  }

  if (!req.body) {
    return errorResponse(res, 'Missing request body', 400)
  }

  const { id, name, cropType, plantingDate, stage, assignedTo } = req.body
  if (!id) {
    return errorResponse(res, 'Field id is required', 400)
  }

  try {
    const fieldResult = await getPool().query('SELECT assigned_to FROM fields WHERE id = $1', [id])
    if (fieldResult.rowCount === 0) {
      return errorResponse(res, 'Field not found', 404)
    }

    const field = fieldResult.rows[0]
    if (user.role === 'agent' && field.assigned_to !== user.id) {
      return errorResponse(res, 'Agent may only update assigned fields', 403)
    }

    const updates = []
    const values = []

    if (user.role === 'agent') {
      if (!stage) {
        return errorResponse(res, 'Stage is required for agent updates', 400)
      }
      if (name || cropType || plantingDate || assignedTo !== undefined) {
        return errorResponse(res, 'Agents may only update the field stage', 403)
      }
      values.push(stage)
      updates.push(`stage = $${values.length}`)
    } else {
      if (name) {
        values.push(name)
        updates.push(`name = $${values.length}`)
      }
      if (cropType) {
        values.push(cropType)
        updates.push(`crop_type = $${values.length}`)
      }
      if (plantingDate) {
        values.push(plantingDate)
        updates.push(`planting_date = $${values.length}`)
      }
      if (stage) {
        values.push(stage)
        updates.push(`stage = $${values.length}`)
      }
      if (assignedTo !== undefined) {
        values.push(assignedTo)
        updates.push(`assigned_to = $${values.length}`)
      }
    }

    if (updates.length === 0) {
      return errorResponse(res, 'No update fields provided', 400)
    }

    values.push(id)
    const statement = `
      UPDATE fields
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, name, crop_type, planting_date, stage, assigned_to, created_by, created_at, updated_at
    `

    const result = await getPool().query(statement, values)
    return jsonResponse(res, formatField(result.rows[0]))
  } catch (error) {
    console.error('Fields update error:', error.message, error.stack)
    return errorResponse(res, 'Internal server error', 500)
  }
}