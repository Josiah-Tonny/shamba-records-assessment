import { FIELD_STAGES } from '../constants/fieldStages.js'

export default function StageSelector({
  id = 'field-stage',
  label = 'Stage',
  value,
  onChange,
  disabled = false,
  selectClassName = 'mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
      >
        {FIELD_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </select>
    </label>
  )
}
