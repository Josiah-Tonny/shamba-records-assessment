import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  default: { bg: 'bg-earth-100', icon: 'text-secondary', },
  primary: { bg: 'bg-primary-100', icon: 'text-primary-600', },
  success: { bg: 'bg-success-100', icon: 'text-success-600', },
  warning: { bg: 'bg-warning-100', icon: 'text-warning-600', },
  error: { bg: 'bg-error-100', icon: 'text-error-600', },
  info: { bg: 'bg-info-100', icon: 'text-info-600', },
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
    <div className={`bg-primary rounded-xl border border-light p-6 transition-all duration-fast hover:-translate-y-1 hover:shadow-lg hover:border-primary-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-tertiary">
            {title}
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            {value}
          </p>

          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-600">
                    +{trend}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-error-600" />
                  <span className="text-sm font-medium text-error-600">
                    {trend}%
                  </span>
                </>
              )}
              {trendLabel && (
                <span className="text-sm text-muted ml-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${styles.bg}`}>
            <Icon className={`w-6 h-6 ${styles.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;