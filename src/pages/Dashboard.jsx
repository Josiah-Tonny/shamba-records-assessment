import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { fetchFields } from '../api/fieldsApi.js'
import { computeFieldStatus } from '../utils/statusLogic.js'

export default function Dashboard() {
  const { logout, token, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadFields() {
      try {
        setLoading(true)
        setError('')
        const result = await fetchFields(token)
        if (!cancelled) {
          setFields(result)
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

  const summary = useMemo(() => {
    const total = fields.length
    const assigned = fields.filter((field) => field.assignedTo).length
    const stageCounts = fields.reduce((acc, field) => {
      if (!field.stage) return acc
      acc[field.stage] = (acc[field.stage] || 0) + 1
      return acc
    }, {})

    const statusCounts = fields.reduce(
      (acc, field) => {
        const status = computeFieldStatus(field)
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      { Active: 0, 'At Risk': 0, Completed: 0 },
    )

    return { total, assigned, stageCounts, statusCounts }
  }, [fields])

  const featuredFields = useMemo(() => {
    return [...fields]
      .sort((a, b) => new Date(b.plantingDate || 0) - new Date(a.plantingDate || 0))
      .slice(0, 3)
  }, [fields])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {user?.name || user?.email}
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/fields"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {isAdmin ? 'Manage fields' : 'My fields'}
              </Link>
              {isAdmin && (
                <Link
                  to="/fields/new"
                  className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Create field
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Sign out
              </button>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-slate-600">
            {isAdmin
              ? 'Admin dashboard: manage fields, review assignments, and track crop progress.'
              : 'Agent dashboard: view your assigned fields, open a field, and submit observations.'}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Role</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{user?.role}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Assigned fields</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.assigned}</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{isAdmin ? 'Total fields' : 'Your fields'}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.total}</p>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-emerald-800">Active</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-900">{summary.statusCounts.Active}</p>
          </article>
          <article className="rounded-3xl border border-amber-100 bg-amber-50/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-amber-900">At risk</p>
            <p className="mt-3 text-2xl font-semibold text-amber-950">{summary.statusCounts['At Risk']}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-slate-100/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Completed</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.statusCounts.Completed}</p>
          </article>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading field summary…</div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Stage distribution</p>
              <div className="mt-6 space-y-4">
                {Object.entries(summary.stageCounts).length === 0 ? (
                  <p className="text-slate-600">No fields available yet.</p>
                ) : (
                  Object.entries(summary.stageCounts).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-700">{stage}</span>
                      <span className="text-sm font-semibold text-slate-900">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent fields</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {isAdmin ? 'Latest assigned work' : 'Your assigned fields'}
                  </h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {featuredFields.length === 0 ? (
                  <p className="text-slate-600">No fields to display yet.</p>
                ) : (
                  featuredFields.map((field) => (
                    <div key={field.id} className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500">{field.cropType}</p>
                          <p className="mt-1 font-semibold text-slate-900">{field.name}</p>
                        </div>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                          {field.stage}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                        <span>
                          Assigned: {field.assignedToName || field.assignedTo || 'Unassigned'}
                        </span>
                        <span>Planted: {field.plantingDate || 'N/A'}</span>
                      </div>
                      <Link
                        to={`/fields/${field.id}`}
                        className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View field
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        )}
      </div>
    </div>
  )
}
