const variantStyles = {
  default: 'bg-[var(--earth-100)] text-[var(--earth-700)]',
  primary: 'bg-[var(--primary-100)] text-[var(--primary-700)]',
  success: 'bg-[var(--success-100)] text-[var(--success-700)]',
  warning: 'bg-[var(--warning-100)] text-[var(--warning-700)]',
  error: 'bg-[var(--error-100)] text-[var(--error-700)]',
  info: 'bg-[var(--info-100)] text-[var(--info-700)]',
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
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
