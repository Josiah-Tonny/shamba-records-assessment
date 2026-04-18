import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createField, fetchFieldById, fetchUsers, updateField } from '../api/fieldsApi.js'
import StageSelector from '../components/StageSelector.jsx'
import { useAuth } from '../hooks/useAuth.jsx'

export default function FieldForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const isEdit = Boolean(id)
  const [form, setForm] = useState({
    name: '',
    cropType: '',
    plantingDate: '',
    stage: 'Planted',
    assignedTo: '',
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(user?.role === 'admin')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      return
    }

    let cancelled = false

    async function loadPage() {
      try {
        setLoading(true)
        setError('')

        const [userList, field] = await Promise.all([
          fetchUsers(token),
          isEdit ? fetchFieldById(id, token) : Promise.resolve(null),
        ])

        if (!cancelled) {
          setUsers(userList)
          if (field) {
            setForm({
              name: field.name || '',
              cropType: field.cropType || '',
              plantingDate: field.plantingDate || '',
              stage: field.stage || 'Planted',
              assignedTo: field.assignedTo || '',
            })
          }
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load form data.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPage()
    return () => {
      cancelled = true
    }
  }, [id, isEdit, token, user?.role])

  const title = isEdit ? 'Edit field' : 'Create field'
  const submitLabel = isEdit ? 'Save changes' : 'Create field'

  const assignedOptions = useMemo(
    () => [{ id: '', name: 'Unassigned' }, ...users],
    [users],
  )

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name || !form.cropType || !form.plantingDate) {
      setError('Name, crop type, and planting date are required.')
      return
    }

    try {
      setSaving(true)

      if (isEdit) {
        await updateField({
          id,
          name: form.name,
          cropType: form.cropType,
          plantingDate: form.plantingDate,
          stage: form.stage,
          assignedTo: form.assignedTo || null,
        }, token)
      } else {
        await createField({
          name: form.name,
          cropType: form.cropType,
          plantingDate: form.plantingDate,
          stage: form.stage,
          assignedTo: form.assignedTo || null,
        }, token)
      }

      navigate('/fields', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to save field.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">Manage field details and assignment.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Field name</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="North Ridge Plot"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Crop type</span>
              <input
                type="text"
                value={form.cropType}
                onChange={handleChange('cropType')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Maize"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Planting date</span>
              <input
                type="date"
                value={form.plantingDate}
                onChange={handleChange('plantingDate')}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <StageSelector
              id="field-form-stage"
              value={form.stage}
              onChange={(nextStage) => setForm((current) => ({ ...current, stage: nextStage }))}
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Assigned agent</span>
            <select
              value={form.assignedTo}
              onChange={handleChange('assignedTo')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {assignedOptions.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name || 'Unassigned'}</option>
              ))}
            </select>
          </label>

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving || loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? 'Saving…' : submitLabel}
            </button>
            <button
              type="button"
              onClick={() => navigate('/fields')}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed sm:w-auto"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
