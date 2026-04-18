import { jsonResponse, errorResponse, pool, verifyRequest } from './shared.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return optionsResponse()
  }

  if (event.httpMethod !== 'GET') {
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

  const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name')
  return jsonResponse(result.rows)
}
