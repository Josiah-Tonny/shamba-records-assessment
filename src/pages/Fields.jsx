import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFields } from '../api/fieldsApi.js'
import { computeFieldStatus } from '../utils/statusLogic.js'
import { useAuth } from '../hooks/useAuth.jsx'
import FieldCard from '../components/FieldCard.jsx'

export default function Fields() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadFields() {
      try {
        const data = await fetchFields(token)
        if (!cancelled) {
          setFields(data)
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load fields at this time.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFields()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {isAdmin ? 'Field management' : 'Your assignments'}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {isAdmin ? 'Fields' : 'My fields'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                to="/fields/new"
                className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create field
              </Link>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading fields…</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} status={computeFieldStatus(field)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
