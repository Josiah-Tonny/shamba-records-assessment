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

const sampleFields = [
  {
    id: 'a1',
    name: 'North Ridge Plot',
    cropType: 'Maize',
    stage: 'Growing',
    plantingDate: '2024-12-08',
    assignedTo: 'agent@smartseason.com',
    lastUpdateAt: '2025-03-31',
  },
  {
    id: 'b2',
    name: 'South Valley Field',
    cropType: 'Beans',
    stage: 'Planted',
    plantingDate: '2025-03-01',
    assignedTo: 'agent@smartseason.com',
    lastUpdateAt: '2025-03-26',
  },
  {
    id: 'c3',
    name: 'East Terrace Block',
    cropType: 'Tomato',
    stage: 'Ready',
    plantingDate: '2024-11-15',
    assignedTo: 'admin@smartseason.com',
    lastUpdateAt: '2025-03-25',
  },
]

async function fetchFromApi(path, token, method = 'GET', body = null) {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured')
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${apiBaseUrl}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchFields(token) {
  if (!apiBaseUrl) {
    return sampleFields
  }
  return fetchFromApi('fields-list', token)
}

export async function fetchFieldById(id, token) {
  if (!apiBaseUrl) {
    return sampleFields.find((field) => field.id === id) ?? null
  }
  const data = await fetchFromApi(`fields-list?fieldId=${encodeURIComponent(id)}`, token)
  return data?.find((field) => field.id === id) ?? null
}

export async function createField(field, token) {
  return fetchFromApi('fields-create', token, 'POST', field)
}

export async function updateField(field, token) {
  return fetchFromApi('fields-update', token, 'PUT', field)
}

export async function deleteField(id, token) {
  return fetchFromApi('fields-delete', token, 'DELETE', { id })
}

export async function fetchFieldUpdates(fieldId, token) {
  return fetchFromApi(`updates-list?fieldId=${encodeURIComponent(fieldId)}`, token)
}

export async function addFieldUpdate(fieldId, update, token) {
  return fetchFromApi('updates-add', token, 'POST', { fieldId, ...update })
}

export async function fetchUsers(token) {
  return fetchFromApi('users-list', token)
}
