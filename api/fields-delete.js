import { jsonResponse, errorResponse, pool, verifyRequest, optionsResponse } from './_shared.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'DELETE') {
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

  if (!req.body) {
    return errorResponse(res, 'Missing request body', 400)
  }

  const { id } = req.body
  if (!id) {
    return errorResponse(res, 'Field id is required', 400)
  }

  try {
    const result = await pool.query('DELETE FROM fields WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return errorResponse(res, 'Field not found', 404)
    }

    return jsonResponse(res, { success: true })
  } catch (error) {
    console.error('Fields delete error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}