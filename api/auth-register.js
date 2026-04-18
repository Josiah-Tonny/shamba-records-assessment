/* global process */
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { jsonResponse, errorResponse, pool, optionsResponse } from './_shared.js'

const JWT_EXPIRES_IN = '8h'

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )
}

// HIGH-RISK: Auth/sensitive data handler — requires human review before merge
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return optionsResponse(res)
  }

  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405)
  }

  if (!req.body) {
    return errorResponse(res, 'Missing request body', 400)
  }

  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return errorResponse(res, 'Name, email, and password are required', 400)
  }

  if (!process.env.JWT_SECRET) {
    return errorResponse(res, 'JWT secret not configured', 500)
  }

  try {
    const lowerEmail = email.toLowerCase()
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail])
    if (exists.rowCount > 0) {
      return errorResponse(res, 'Email already registered', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const statement = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role'
    const result = await pool.query(statement, [name, lowerEmail, hashedPassword, 'agent'])
    const user = result.rows[0]
    const token = createToken(user)

    return jsonResponse(res, {
      token,
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
}