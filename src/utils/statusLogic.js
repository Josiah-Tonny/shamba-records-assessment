const DAY_MS = 24 * 60 * 60 * 1000

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS)
}

export function computeFieldStatus(field) {
  const { stage, plantingDate, lastUpdateAt, updatedAt } = field
  const today = new Date()
  const planted = parseDate(plantingDate)
  const lastUpdate = parseDate(lastUpdateAt || updatedAt)

  if (stage === 'Harvested') {
    return 'Completed'
  }

  const ageInDays = planted ? daysBetween(planted, today) : 0
  const updateAgeInDays = lastUpdate ? daysBetween(lastUpdate, today) : Infinity

  if (ageInDays > 120 || updateAgeInDays > 14) {
    return 'At Risk'
  }

  return 'Active'
}
