import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchFieldById } from '../api/fieldsApi.js'
import { computeFieldStatus } from '../utils/statusLogic.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function FieldDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [field, setField] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadField() {
      try {
        const data = await fetchFieldById(id)
        if (!cancelled) {
          setField(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load field details.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) {
      loadField()
    }

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading field…</div>
      </div>
    )
  }

  if (error || !field) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
          {error || 'Field not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Field details</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{field.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/fields')}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            Back to fields
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Crop type</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{field.cropType}</p>
            </div>
            <StatusBadge status={computeFieldStatus(field)} />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">Stage</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{field.stage}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">Planting date</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{field.plantingDate}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">Assigned to</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{field.assignedTo}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">Last update</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{field.lastUpdateAt || 'No updates yet'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
