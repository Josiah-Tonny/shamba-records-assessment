import StageSelector from './StageSelector.jsx'

export default function UpdateForm({
  stage,
  notes,
  onStageChange,
  onNotesChange,
  onSubmit,
  saving,
  error,
  stageInputId = 'update-stage',
}) {
  return (
    <form className="mt-6 space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <StageSelector
          id={stageInputId}
          value={stage}
          onChange={onStageChange}
          disabled={saving}
        />
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={4}
            disabled={saving}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Add details about what you observed in the field."
          />
        </label>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving…' : 'Submit update'}
        </button>
      </div>
    </form>
  )
}
