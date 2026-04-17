const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

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

async function fetchFromApi(path) {
  if (!apiBaseUrl) {
    throw new Error('API base URL is not configured')
  }

  const response = await fetch(`${apiBaseUrl}/${path}`)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchFields() {
  try {
    return await fetchFromApi('fields-list')
  } catch (error) {
    return sampleFields
  }
}

export async function fetchFieldById(id) {
  try {
    const data = await fetchFromApi(`fields-list?fieldId=${encodeURIComponent(id)}`)
    return data?.find((field) => field.id === id) ?? null
  } catch (error) {
    return sampleFields.find((field) => field.id === id) ?? null
  }
}
