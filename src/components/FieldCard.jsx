import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function FieldCard({ field, status }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{field.cropType}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{field.name}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-900">Stage:</span> {field.stage}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Planted:</span> {field.plantingDate}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Assigned:</span> {field.assignedTo}
        </p>
      </div>

      <Link
        to={`/fields/${field.id}`}
        className="mt-6 inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        View details
      </Link>
    </article>
  )
}
