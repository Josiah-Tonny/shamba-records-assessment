import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: 'bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] focus:ring-[var(--primary-500)]',
  secondary: 'bg-[var(--earth-200)] text-[var(--earth-800)] hover:bg-[var(--earth-300)] focus:ring-[var(--earth-400)]',
  outline: 'border-2 border-[var(--primary-600)] text-[var(--primary-600)] hover:bg-[var(--primary-50)] focus:ring-[var(--primary-500)]',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--earth-100)] hover:text-[var(--text-primary)] focus:ring-[var(--earth-400)]',
  danger: 'bg-[var(--error-600)] text-white hover:bg-[var(--error-700)] focus:ring-[var(--error-500)]',
  success: 'bg-[var(--success-600)] text-white hover:bg-[var(--success-700)] focus:ring-[var(--success-500)]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
