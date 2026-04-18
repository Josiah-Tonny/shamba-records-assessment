/* global process */
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { jsonResponse, errorResponse, pool } from './shared.js'

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
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return optionsResponse()
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  if (!event.body) {
    return errorResponse('Missing request body', 400)
  }

  const { name, email, password } = JSON.parse(event.body)
  if (!name || !email || !password) {
    return errorResponse('Name, email, and password are required', 400)
  }

  if (!process.env.JWT_SECRET) {
    return errorResponse('JWT secret not configured', 500)
  }

  const lowerEmail = email.toLowerCase()
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail])
  if (exists.rowCount > 0) {
    return errorResponse('Email already registered', 409)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const statement = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role'
  const result = await pool.query(statement, [name, lowerEmail, hashedPassword, 'agent'])
  const user = result.rows[0]
  const token = createToken(user)

  return jsonResponse({
    token,
    user,
  })
}
