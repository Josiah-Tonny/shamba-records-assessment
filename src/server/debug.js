/* global process */
import { jsonResponse, errorResponse, optionsResponse } from './_shared.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  // Debug endpoint to check environment configuration
  const debug = {
    timestamp: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV || 'not set',
      has_database_url: !!process.env.DATABASE_URL,
      database_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
      has_jwt_secret: !!process.env.JWT_SECRET,
      jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    },
    headers: req.headers,
  }

  return jsonResponse(res, debug)
}