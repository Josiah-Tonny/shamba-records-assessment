import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-bold mb-2 text-primary tracking-tight">
          {label}
          {required && <span className="text-primary-600 ml-1.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative group/input">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 transition-colors group-focus-within/input:text-primary-500">
            <Icon className="w-5 h-5 text-muted/60" />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`input h-11 transition-all duration-300 ring-offset-white focus:ring-4 focus:ring-primary-500/10 ${Icon ? 'pl-11 ' : ''}${isPassword ? 'pr-12 ' : ''}${error ? 'border-error-500 focus:ring-error-500/10 focus:border-error-500' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 -mr-1 text-muted/60 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-bold text-error-600 uppercase tracking-widest animate-shake">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
