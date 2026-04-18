/* global process */
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'

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
