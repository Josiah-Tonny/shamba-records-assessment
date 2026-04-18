/* global process */
import { jsonResponse, errorResponse, getPool, optionsResponse } from './_shared.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || 'not set',
      has_database_url: !!process.env.DATABASE_URL,
      has_jwt_secret: !!process.env.JWT_SECRET,
      database_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    },
    database: {
      connected: false,
      error: null,
      userCount: null,
    },
  }

  // Test database connection
  if (process.env.DATABASE_URL) {
    try {
      const result = await getPool().query('SELECT COUNT(*) as count FROM users')
      checks.database.connected = true
      checks.database.userCount = parseInt(result.rows[0].count, 10)
    } catch (error) {
      checks.database.error = error.message
      console.error('Health check - Database error:', error)
    }
  } else {
    checks.database.error = 'DATABASE_URL not configured'
  }

  const statusCode = checks.database.connected ? 200 : 503
  return jsonResponse(res, checks, statusCode)
}
