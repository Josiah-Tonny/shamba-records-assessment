const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const apiBaseUrl = (() => {
  const normalized = configuredApiBaseUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined' && normalized.includes('localhost')) {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api'
    }
  }
  return normalized || '/api'
})()

function jsonResponse(response) {
  return response.text().then((text) => {
    // Handle non-JSON responses
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server')
    }
    
    let data
    try {
      data = JSON.parse(text)
    } catch {
      // If JSON parsing fails, the server likely returned an HTML error page
      if (response.status === 500) {
        throw new Error('Server error: Please check if the database is properly configured')
      }
      throw new Error(`Invalid response from server: ${text.substring(0, 100)}...`)
    }
    
    if (!response.ok) {
      throw new Error(data?.error || `Server error: ${response.status}`)
    }
    return data
  })
}

async function post(path, body) {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured')
  }

  const response = await fetch(`${apiBaseUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return jsonResponse(response)
}

export function loginUser(credentials) {
  return post('auth-login', credentials)
}

export function registerUser(credentials) {
  return post('auth-register', credentials)
}
