const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const apiBaseUrl = (() => {
  const normalized = configuredApiBaseUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined' && normalized.includes('localhost')) {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/.netlify/functions'
    }
  }
  return normalized || '/.netlify/functions'
})()

function jsonResponse(response) {
  return response.json().then((data) => {
    if (!response.ok) {
      throw new Error(data?.error || 'Request failed')
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
