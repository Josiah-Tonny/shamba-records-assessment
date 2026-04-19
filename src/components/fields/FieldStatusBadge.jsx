const STATUS_MAP = {
  active: {
    label: 'Active',
    dot:   'bg-[var(--primary-500)]',
    pill:  'bg-[var(--primary-50)] text-[var(--primary-700)] border border-[var(--primary-200)]',
  },
  at_risk: {
    label: 'At Risk',
    dot:   'bg-[var(--warning-500,#f59e0b)]',
    pill:  'bg-[var(--warning-50,#fffbeb)] text-[var(--warning-700,#b45309)] border border-[var(--warning-200,#fde68a)]',
  },
  completed: {
    label: 'Completed',
    dot:   'bg-[var(--success-500,#22c55e)]',
    pill:  'bg-[var(--success-50,#f0fdf4)] text-[var(--success-700,#15803d)] border border-[var(--success-200,#bbf7d0)]',
  },
};

const FALLBACK = {
  label: '',
  dot:   'bg-[var(--border-default)]',
  pill:  'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-light)]',
};

const FieldStatusBadge = ({ status }) => {
  const key        = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  const config     = STATUS_MAP[key] ?? { ...FALLBACK, label: status ?? '—' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-semibold leading-none whitespace-nowrap
                  ${config.pill}`}
    >
      {/* Pulsing dot for at_risk, static for others */}
      <span className="relative flex items-center justify-center w-1.5 h-1.5">
        {key === 'at_risk' && (
          <span
            className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};

export default FieldStatusBadge;