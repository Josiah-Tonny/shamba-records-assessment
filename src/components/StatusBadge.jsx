export default function StatusBadge({ status }) {
  const statusClasses = {
    Active: 'bg-emerald-100 text-emerald-700',
    'At Risk': 'bg-amber-100 text-amber-700',
    Completed: 'bg-slate-100 text-slate-900',
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
