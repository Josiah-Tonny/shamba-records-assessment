const variantStyles = {
  default: 'bg-earth-100 text-earth-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  info: 'bg-info-100 text-info-700',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full transition-all duration-fast ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
