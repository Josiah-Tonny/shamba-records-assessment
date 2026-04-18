/* global process */
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

function jsonResponse(res, payload, statusCode = 200) {
  res.status(statusCode).set(DEFAULT_HEADERS).json(payload)
}

function errorResponse(res, message, statusCode = 400) {
  jsonResponse(res, { error: message }, statusCode)
}

function optionsResponse(res) {
  res.status(204).set(DEFAULT_HEADERS).end()
}

function getBearerToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }
  const [, token] = authHeader.split(' ')
  return token || null
}

// HIGH-RISK: Auth/sensitive data handler — requires human review before merge
function verifyRequest(req) {
  const token = getBearerToken(req)
  if (!token) {
    throw new Error('Missing authorization token')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.verify(token, process.env.JWT_SECRET)
}

export { pool, jsonResponse, errorResponse, verifyRequest, optionsResponse }