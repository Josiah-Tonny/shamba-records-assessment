import { jsonResponse, errorResponse, pool, verifyRequest } from './shared.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return optionsResponse()
  }

  if (event.httpMethod !== 'DELETE') {
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

  const { id } = JSON.parse(event.body)
  if (!id) {
    return errorResponse('Field id is required', 400)
  }

  const result = await pool.query('DELETE FROM fields WHERE id = $1', [id])
  if (result.rowCount === 0) {
    return errorResponse('Field not found', 404)
  }

  return jsonResponse({ success: true })
}
