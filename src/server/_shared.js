/* global process */
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

// Load .env for local development
function loadDotEnv() {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    return
  }

  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const [key, ...rest] = line.split('=')
    const value = rest.join('=')
    if (key && value && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

let pool = null

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }
  return pool
}

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

export { getPool, jsonResponse, errorResponse, verifyRequest, optionsResponse }