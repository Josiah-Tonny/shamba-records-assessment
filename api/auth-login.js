/* global process */
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { jsonResponse, errorResponse, getPool, optionsResponse } from './_shared.js'

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

  const { email, password } = req.body
  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400)
  }

  if (!process.env.JWT_SECRET) {
    console.error('Login error: JWT_SECRET not configured')
    return errorResponse(res, 'JWT secret not configured', 500)
  }

  if (!process.env.DATABASE_URL) {
    console.error('Login error: DATABASE_URL not configured')
    return errorResponse(res, 'Database not configured', 500)
  }

  try {
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = $1'
    const result = await getPool().query(query, [email.toLowerCase()])

    if (result.rowCount === 0) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    const token = createToken(user)
    return jsonResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message, error.stack)
    // Return specific error message for debugging
    return errorResponse(res, `Database error: ${error.message}`, 500)
  }
}