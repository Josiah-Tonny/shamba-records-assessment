const STATUS_MAP = {
  active: {
    label: 'Active',
    dot:   'bg-green-500',
    pill:  'bg-green-50 text-green-700 border border-green-200',
  },
  at_risk: {
    label: 'At Risk',
    dot:   'bg-amber-500',
    pill:  'bg-amber-50 text-amber-700 border border-amber-200',
  },
  completed: {
    label: 'Completed',
    dot:   'bg-green-500',
    pill:  'bg-green-50 text-green-700 border border-green-200',
  },
};

const FALLBACK = {
  label: '',
  dot:   'bg-gray-400',
  pill:  'bg-gray-100 text-gray-500 border border-gray-200',
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