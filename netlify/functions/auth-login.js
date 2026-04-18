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

  const { email, password } = JSON.parse(event.body)
  if (!email || !password) {
    return errorResponse('Email and password are required', 400)
  }

  if (!process.env.JWT_SECRET) {
    return errorResponse('JWT secret not configured', 500)
  }

  const query = 'SELECT id, name, email, password, role FROM users WHERE email = $1'
  const result = await pool.query(query, [email.toLowerCase()])

  if (result.rowCount === 0) {
    return errorResponse('Invalid credentials', 401)
  }

  const user = result.rows[0]
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return errorResponse('Invalid credentials', 401)
  }

  const token = createToken(user)
  return jsonResponse({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
