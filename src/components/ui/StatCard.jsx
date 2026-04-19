import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  default: { 
    bg: 'bg-gray-50', 
    iconBg: 'bg-gray-100',
    icon: 'text-gray-600', 
    accent: 'bg-gray-400'
  },
  primary: { 
    bg: 'bg-emerald-50', 
    iconBg: 'bg-emerald-100',
    icon: 'text-emerald-600', 
    accent: 'bg-emerald-500'
  },
  success: { 
    bg: 'bg-emerald-50', 
    iconBg: 'bg-emerald-100',
    icon: 'text-emerald-600', 
    accent: 'bg-emerald-500'
  },
  warning: { 
    bg: 'bg-amber-50', 
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600', 
    accent: 'bg-amber-500'
  },
  error: { 
    bg: 'bg-red-50', 
    iconBg: 'bg-red-100',
    icon: 'text-red-600', 
    accent: 'bg-red-500'
  },
  info: { 
    bg: 'bg-blue-50', 
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600', 
    accent: 'bg-blue-500'
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  trendLabel,
  className = ''
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={`group relative bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${className}`}>
      {/* Decorative accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full opacity-60 group-hover:opacity-100 transition-opacity ${styles.accent}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
              </div>
              {trendLabel && (
                <span className="text-xs text-gray-500 font-medium">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${styles.iconBg}`}>
            <Icon className={`w-7 h-7 ${styles.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
