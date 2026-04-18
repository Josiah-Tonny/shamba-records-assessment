import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addFieldUpdate, deleteField, fetchFieldById, fetchFieldUpdates } from '../api/fieldsApi.js'
import { computeFieldStatus } from '../utils/statusLogic.js'
import { useAuth } from '../hooks/useAuth.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import UpdateForm from '../components/UpdateForm.jsx'

export default function FieldDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [field, setField] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updates, setUpdates] = useState([])
  const [updatesLoading, setUpdatesLoading] = useState(false)
  const [updatesError, setUpdatesError] = useState('')
  const [updateForm, setUpdateForm] = useState({ stage: 'Growing', notes: '' })
  const [updateSaving, setUpdateSaving] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const canEdit = user?.role === 'admin'
  const isAssignedAgent = Boolean(
    user?.role === 'agent' && field?.assignedTo && user?.id && field.assignedTo === user.id,
  )
  const canAddUpdate = isAssignedAgent

  useEffect(() => {
    let cancelled = false

    async function loadField() {
      try {
        const data = await fetchFieldById(id, token)
        if (!cancelled) {
          setField(data)
        }
      } catch {
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
  }, [id, token])

  useEffect(() => {
    let cancelled = false

    async function loadUpdates() {
      if (!field?.id) {
        return
      }

      try {
        setUpdatesLoading(true)
        setUpdatesError('')
        const data = await fetchFieldUpdates(field.id, token)
        if (!cancelled) {
          setUpdates(data)
        }
      } catch {
        if (!cancelled) {
          setUpdatesError('Unable to load update history.')
        }
      } finally {
        if (!cancelled) {
          setUpdatesLoading(false)
        }
      }
    }

    loadUpdates()
    return () => {
      cancelled = true
    }
  }, [field?.id, token])

  const reloadField = async () => {
    try {
      const data = await fetchFieldById(id, token)
      setField(data)
    } catch {
      // keep the existing field if reload fails
    }
  }

  const handleDelete = async () => {
    if (!field?.id) {
      return
    }

    if (!window.confirm('Delete this field? This action cannot be undone.')) {
      return
    }

    try {
      setDeleteLoading(true)
      await deleteField(field.id, token)
      navigate('/fields')
    } catch {
      setError('Unable to delete the field.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddUpdate = async (event) => {
    event.preventDefault()
    if (!field?.id) {
      return
    }

    if (!updateForm.stage) {
      setUpdateError('Please select an update stage.')
      return
    }

    try {
      setUpdateError('')
      setUpdateSaving(true)
      await addFieldUpdate(field.id, updateForm, token)
      setUpdateForm({ stage: 'Growing', notes: '' })
      await reloadField()
      const refreshed = await fetchFieldUpdates(field.id, token)
      setUpdates(refreshed)
    } catch {
      setUpdateError('Unable to save the field update.')
    } finally {
      setUpdateSaving(false)
    }
  }

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
          <div className="flex flex-wrap items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/fields/${field.id}/edit`)}
                className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit field
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting…' : 'Delete field'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/fields')}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Back to fields
            </button>
          </div>
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
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {field.assignedToName || field.assignedTo || 'Unassigned'}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">Last update</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{field.updatedAt || field.lastUpdateAt || 'No updates yet'}</p>
            </div>
          </div>
        </div>

        {canAddUpdate && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Add observation</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Record a field update</h2>
            </div>
            <UpdateForm
              stage={updateForm.stage}
              notes={updateForm.notes}
              onStageChange={(nextStage) => setUpdateForm((current) => ({ ...current, stage: nextStage }))}
              onNotesChange={(nextNotes) => setUpdateForm((current) => ({ ...current, notes: nextNotes }))}
              onSubmit={handleAddUpdate}
              saving={updateSaving}
              error={updateError}
            />
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Update history</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent observations</h2>
            </div>
          </div>

          {updatesLoading ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Loading updates…</div>
          ) : updatesError ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{updatesError}</div>
          ) : updates.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">No updates have been recorded for this field yet.</div>
          ) : (
            <ol className="mt-6 space-y-4">
              {updates.map((update) => (
                <li key={update.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Stage</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{update.stage}</p>
                    </div>
                    <div className="text-sm text-slate-500">{new Date(update.createdAt).toLocaleString()}</div>
                  </div>
                  {update.notes && <p className="mt-4 text-slate-600">{update.notes}</p>}
                  <p className="mt-4 text-sm text-slate-500">Updated by {update.agent?.name || update.agent?.email || 'unknown'}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
