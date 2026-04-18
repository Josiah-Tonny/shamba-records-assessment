import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeFieldStatus } from './statusLogic.js'

const DAY_MS = 24 * 60 * 60 * 1000

function isoDaysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString()
}

describe('computeFieldStatus', () => {
  it('marks harvested fields as completed', () => {
    assert.equal(
      computeFieldStatus({
        stage: 'Harvested',
        plantingDate: '2020-01-01',
        lastUpdateAt: isoDaysAgo(400),
      }),
      'Completed',
    )
  })

  it('marks active fields when age and updates are within thresholds', () => {
    assert.equal(
      computeFieldStatus({
        stage: 'Growing',
        plantingDate: isoDaysAgo(30),
        lastUpdateAt: isoDaysAgo(3),
      }),
      'Active',
    )
  })

  it('marks at risk when planting age exceeds 120 days', () => {
    assert.equal(
      computeFieldStatus({
        stage: 'Growing',
        plantingDate: isoDaysAgo(200),
        lastUpdateAt: isoDaysAgo(1),
      }),
      'At Risk',
    )
  })

  it('marks at risk when the last update is older than 14 days', () => {
    assert.equal(
      computeFieldStatus({
        stage: 'Growing',
        plantingDate: isoDaysAgo(10),
        lastUpdateAt: isoDaysAgo(20),
      }),
      'At Risk',
    )
  })

  it('falls back to updatedAt when lastUpdateAt is missing', () => {
    assert.equal(
      computeFieldStatus({
        stage: 'Growing',
        plantingDate: isoDaysAgo(10),
        updatedAt: isoDaysAgo(3),
      }),
      'Active',
    )
  })
})
