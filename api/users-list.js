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

  if (user.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403)
  }

  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name')
    return jsonResponse(res, result.rows)
  } catch (error) {
    console.error('Users list error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}