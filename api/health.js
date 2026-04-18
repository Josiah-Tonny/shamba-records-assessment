/* global process */
import { jsonResponse, errorResponse, optionsResponse } from './_shared.js'
import { getPool } from './database.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null,
    },
  }

  // Test database connection
  if (process.env.DATABASE_URL) {
    try {
      await getPool().query('SELECT 1')
      checks.database.connected = true
    } catch (error) {
      checks.database.error = 'database unavailable'
      console.error('Health check - Database error:', error.message, error.stack)
    }
  } else {
    checks.database.error = 'database unavailable'
    console.error('Health check - DATABASE_URL not configured')
  }

  const statusCode = checks.database.connected ? 200 : 503
  return jsonResponse(res, checks, statusCode)
}
