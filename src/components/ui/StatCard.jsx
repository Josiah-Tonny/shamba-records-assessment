import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  default: { 
    bg: 'bg-amber-100', 
    iconBg: 'bg-amber-200/50',
    icon: 'text-gray-600', 
    accent: 'bg-amber-400'
  },
  primary: { 
    bg: 'bg-green-50', 
    iconBg: 'bg-green-100',
    icon: 'text-green-600', 
    accent: 'bg-green-500'
  },
  success: { 
    bg: 'bg-green-50', 
    iconBg: 'bg-green-100',
    icon: 'text-green-600', 
    accent: 'bg-green-500'
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
    <div className={`group relative bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/40 hover:-translate-y-1 overflow-hidden ${className}`}>
      {/* Decorative accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full opacity-60 group-hover:opacity-100 transition-opacity ${styles.accent}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {value}
            </p>
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
              </div>
              {trendLabel && (
                <span className="text-[10px] text-gray-500 font-medium">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${styles.iconBg}`}>
            <Icon className={`w-6 h-6 ${styles.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
