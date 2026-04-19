import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  default: { 
    bg: 'bg-earth-100', 
    iconBg: 'bg-earth-200/50',
    icon: 'text-secondary', 
    accent: 'bg-earth-400'
  },
  primary: { 
    bg: 'bg-primary-50', 
    iconBg: 'bg-primary-100',
    icon: 'text-primary-600', 
    accent: 'bg-primary-500'
  },
  success: { 
    bg: 'bg-success-50', 
    iconBg: 'bg-success-100',
    icon: 'text-success-600', 
    accent: 'bg-success-500'
  },
  warning: { 
    bg: 'bg-warning-50', 
    iconBg: 'bg-warning-100',
    icon: 'text-warning-600', 
    accent: 'bg-warning-500'
  },
  error: { 
    bg: 'bg-error-50', 
    iconBg: 'bg-error-100',
    icon: 'text-error-600', 
    accent: 'bg-error-500'
  },
  info: { 
    bg: 'bg-info-50', 
    iconBg: 'bg-info-100',
    icon: 'text-info-600', 
    accent: 'bg-info-500'
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
    <div className={`group relative bg-white rounded-2xl border border-light p-5 transition-all duration-300 hover:shadow-xl hover:shadow-earth-200/40 hover:-translate-y-1 overflow-hidden ${className}`}>
      {/* Decorative accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full opacity-60 group-hover:opacity-100 transition-opacity ${styles.accent}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {value}
            </p>
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${trend >= 0 ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{trend}%
              </div>
              {trendLabel && (
                <span className="text-[10px] text-muted font-medium">
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
