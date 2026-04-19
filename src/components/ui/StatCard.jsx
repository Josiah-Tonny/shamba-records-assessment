import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  default: { bg: 'badge-default', icon: 'text-[var(--text-secondary)]', },
  primary: { bg: 'badge-primary', icon: 'text-[var(--primary-600)]', },
  success: { bg: 'badge-success', icon: 'text-[var(--success-600)]', },
  warning: { bg: 'badge-warning', icon: 'text-[var(--warning-600)]', },
  error: { bg: 'badge-error', icon: 'text-[var(--error-600)]', },
  info: { bg: 'badge-info', icon: 'text-[var(--info-600)]', },
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
    <div className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <div className="flex-1">
          <p className="stat-card-title">
            {title}
          </p>
          <p className="stat-card-value">
            {value}
          </p>
          
          {trend !== undefined && (
            <div className="stat-card-trend">
              {trend >= 0 ? (
                <>
                  <TrendingUp className="positive" />
                  <span className="text-sm positive font-medium">
                    +{trend}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="negative" />
                  <span className="text-sm negative font-medium">
                    {trend}%
                  </span>
                </>
              )}
              {trendLabel && (
                <span className="text-sm text-[var(--text-muted)] ml-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`stat-card-icon ${styles.bg}`}>
            <Icon className={styles.icon} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;