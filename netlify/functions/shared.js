/* global process */
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

function jsonResponse(payload, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
}

function errorResponse(message, statusCode = 400) {
  return jsonResponse({ error: message }, statusCode)
}

function getBearerToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }
  const [, token] = authHeader.split(' ')
  return token || null
}

// HIGH-RISK: Auth/sensitive data handler — requires human review before merge
function verifyRequest(event) {
  const token = getBearerToken(event)
  if (!token) {
    throw new Error('Missing authorization token')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.verify(token, process.env.JWT_SECRET)
}

export { pool, jsonResponse, errorResponse, verifyRequest }
