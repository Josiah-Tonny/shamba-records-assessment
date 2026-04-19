import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false,
  text,
  className = ''
}) => {
  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Loader2 
        className={`${sizeMap[size]} animate-spin text-[var(--primary-600)]`} 
      />
      {text && (
        <p className="text-sm text-[var(--text-secondary)]">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;